#!/usr/bin/env bash

set -euo pipefail

SCRIPT_NAME=$(basename "$0")
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Default configuration
DEFAULT_REGISTRIES=("registry.oglimmer.com")
DEFAULT_DEPLOYMENT="citybuilder"

REGISTRIES=("${DEFAULT_REGISTRIES[@]}")
IMAGES=()
DEPLOYMENT="$DEFAULT_DEPLOYMENT"

# Default options
BUILD="${BUILD:-false}"
VERBOSE="${VERBOSE:-false}"
DRY_RUN="${DRY_RUN:-false}"
RESTART="${RESTART:-true}"
PUSH="${PUSH:-true}"
HELP=false
PLATFORM="${PLATFORM:-arm64}"

# Color output
if [[ -t 1 ]] && command -v tput >/dev/null 2>&1; then
  BOLD="$(tput bold)"
  GREEN="$(tput setaf 2)"
  YELLOW="$(tput setaf 3)"
  RED="$(tput setaf 1)"
  BLUE="$(tput setaf 4)"
  RESET="$(tput sgr0)"
else
  BOLD="" GREEN="" YELLOW="" RED="" BLUE="" RESET=""
fi

log_info()    { echo -e "${BLUE}[INFO]${RESET} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${RESET} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${RESET} $1"; }
log_error()   { echo -e "${RED}[ERROR]${RESET} $1" >&2; }
log_verbose() { [[ "$VERBOSE" == true ]] && echo -e "${BLUE}[VERBOSE]${RESET} $1" || true; }

execute_cmd() {
    local cmd="$1"
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}[DRY-RUN]${RESET} ${cmd}"
        return 0
    else
        log_verbose "Executing: $cmd"
        if [[ "$VERBOSE" == true ]]; then
            eval "$cmd"
        else
            eval "$cmd" >/dev/null 2>&1
        fi
    fi
}

show_help() {
    cat << EOF
Usage: ${SCRIPT_NAME} [OPTIONS] [COMMAND]

Build, deploy, and manage the CityBuilder application.

COMMANDS:
    build               Build and deploy (default)

BUILD OPTIONS:
    -v, --verbose           Enable verbose output
    -n, --no-restart        Skip Kubernetes deployment restart
    --no-push               Skip pushing images to registry
    --dry-run               Show what would be done without executing

    --registries "REG1,REG2"    Comma-separated list of registries (default: ${DEFAULT_REGISTRIES[0]})
    --deploy NAME               Deployment name (default: $DEFAULT_DEPLOYMENT)

    --platform PLATFORM        Target platform(s) for Docker build:
                               - amd64: Build for AMD64/x86_64
                               - arm64: Build for ARM64 (default)
                               - multi: Build for both amd64 and arm64
                               - auto: Detect current platform

    -h, --help              Show this help message

EXAMPLES:
    ${SCRIPT_NAME} build                              # Build and deploy
    ${SCRIPT_NAME} build -v                            # Build with verbose output
    ${SCRIPT_NAME} build --platform amd64              # Build for AMD64
    ${SCRIPT_NAME} build --no-push --no-restart        # Local build only
    ${SCRIPT_NAME} build --registries "reg1.com,reg2.com"  # Push to multiple registries

ENVIRONMENT VARIABLES:
    PLATFORM                Override default platform (amd64|arm64|multi|auto)
    VERBOSE                 Enable verbose mode (true/false)
    DRY_RUN                 Enable dry-run mode (true/false)
    PUSH                    Enable/disable pushing to registry (true/false)
    RESTART                 Enable/disable Kubernetes restart (true/false)

EOF
}

parse_args() {
    if [[ $# -gt 0 ]]; then
        case $1 in
            build) shift ;;
            help|-h|--help) HELP=true; shift ;;
        esac
    fi

    while [[ $# -gt 0 ]]; do
        case $1 in
            -v|--verbose) VERBOSE=true; shift ;;
            -n|--no-restart) RESTART=false; shift ;;
            --no-push) PUSH=false; shift ;;
            --dry-run) DRY_RUN=true; shift ;;
            --registries)
                REGISTRIES=()
                IFS=',' read -ra ADDR <<< "$2"
                for registry in "${ADDR[@]}"; do
                    REGISTRIES+=("$(echo "$registry" | xargs)")
                done
                shift 2
                ;;
            --deploy) DEPLOYMENT="$2"; shift 2 ;;
            --platform) PLATFORM="$2"; shift 2 ;;
            -h|--help) HELP=true; shift ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    PLATFORM="${DOCKER_PLATFORM:-$PLATFORM}"

    if [[ -n "${DEFAULT_REGISTRIES_ENV:-}" ]]; then
        REGISTRIES=()
        IFS=',' read -ra ADDR <<< "$DEFAULT_REGISTRIES_ENV"
        for registry in "${ADDR[@]}"; do
            REGISTRIES+=("$(echo "$registry" | xargs)")
        done
    fi

    IMAGES=()
    for registry in "${REGISTRIES[@]}"; do
        IMAGES+=("$registry/citybuilder")
    done

    if [[ -n "$PLATFORM" && ! "$PLATFORM" =~ ^(amd64|arm64|multi|auto)$ ]]; then
        log_error "Invalid platform: $PLATFORM. Must be one of: amd64, arm64, multi, auto"
        exit 1
    fi

    if [[ "$PUSH" == false && "$RESTART" == true ]]; then
        log_warning "Cannot restart deployments without pushing images. Setting --no-restart."
        RESTART=false
    fi

    BUILD=true
}

check_prerequisites() {
    local tools=("docker" "kubectl")
    local missing_deps=()

    for tool in "${tools[@]}"; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            missing_deps+=("$tool")
        fi
    done

    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        exit 1
    fi

    if [[ "$DRY_RUN" != true ]] && ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon is not running"
        exit 1
    fi

    if [[ "$PLATFORM" == "multi" ]]; then
        if ! docker buildx version &> /dev/null; then
            log_error "Docker buildx is required for multi-platform builds"
            exit 1
        fi
        if ! docker buildx inspect &> /dev/null; then
            log_info "Creating buildx builder instance..."
            docker buildx create --use --name multiplatform-builder 2>/dev/null || true
        fi
    fi

    log_verbose "All required tools are available"
}

get_platform_args() {
    case "$PLATFORM" in
        "amd64") echo "--platform linux/amd64" ;;
        "arm64") echo "--platform linux/arm64" ;;
        "multi") echo "--platform linux/amd64,linux/arm64" ;;
        "auto"|"") echo "" ;;
    esac
}

build_image() {
    local platform_args=$(get_platform_args)
    local primary_tag="${IMAGES[0]}"

    log_info "Building citybuilder image for ${#IMAGES[@]} target(s):"
    for tag in "${IMAGES[@]}"; do
        log_info "  - $tag"
    done
    [[ -n "$platform_args" ]] && log_info "Target platform(s): $PLATFORM"

    local build_cmd=""

    if [[ "$PLATFORM" == "multi" || (-n "$PLATFORM" && "$PLATFORM" != "auto") ]]; then
        build_cmd="docker buildx build $platform_args"
        for tag in "${IMAGES[@]}"; do
            build_cmd="$build_cmd --tag $tag"
        done

        if [[ "$PUSH" == true ]]; then
            build_cmd="$build_cmd --push"
        elif [[ "$PLATFORM" != "multi" ]]; then
            build_cmd="$build_cmd --load"
        else
            log_warning "Multi-platform builds cannot be loaded locally, forcing push"
            build_cmd="$build_cmd --push"
        fi
        build_cmd="$build_cmd ."
    else
        build_cmd="docker build $platform_args --tag $primary_tag ."
        if [[ ${#IMAGES[@]} -gt 1 ]]; then
            for tag in "${IMAGES[@]:1}"; do
                build_cmd="$build_cmd && docker tag $primary_tag $tag"
            done
        fi
        if [[ "$PUSH" == true ]]; then
            for tag in "${IMAGES[@]}"; do
                build_cmd="$build_cmd && docker push $tag"
            done
        fi
    fi

    log_verbose "Build command: $build_cmd"

    if execute_cmd "$build_cmd"; then
        log_success "Image built successfully"
        if [[ "$PUSH" == true ]]; then
            log_success "Image pushed to ${#IMAGES[@]} target(s)"
        else
            log_info "Image tagged locally (not pushed)"
        fi
    else
        log_error "Failed to build image"
        exit 1
    fi
}

restart_deployment() {
    log_info "Restarting deployment: $DEPLOYMENT"
    if execute_cmd "kubectl rollout restart deployment/$DEPLOYMENT"; then
        log_success "Deployment $DEPLOYMENT restarted successfully"
        if [[ "$VERBOSE" == true ]]; then
            log_info "Waiting for rollout to complete..."
            kubectl rollout status deployment/"$DEPLOYMENT" --timeout=300s
        fi
    else
        log_error "Failed to restart deployment: $DEPLOYMENT"
        exit 1
    fi
}

execute_build() {
    echo -e "${BOLD}=== Build Configuration ===${RESET}"
    echo "Registries:        ${REGISTRIES[*]}"
    echo "Platform:          ${PLATFORM:-auto}"
    echo "Push to Registry:  $PUSH"
    echo "Restart K8s:       $RESTART"
    echo "Deployment:        $DEPLOYMENT"
    echo "Dry-run:           $DRY_RUN"
    echo "Verbose:           $VERBOSE"
    echo -e "${BOLD}===========================${RESET}"
    echo

    log_info "Starting build process..."

    build_image

    if [[ "$RESTART" == true ]]; then
        restart_deployment
    else
        log_info "Skipping deployment restart"
    fi

    echo
    echo -e "${BOLD}${GREEN}✓ All operations completed successfully${RESET}"
}

main() {
    if [[ $# -eq 0 ]]; then
        show_help
        exit 0
    fi

    parse_args "$@"

    if [[ "$HELP" == true ]]; then
        show_help
        exit 0
    fi

    check_prerequisites
    execute_build
}

main "$@"
