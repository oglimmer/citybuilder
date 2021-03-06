#!/usr/bin/env bash

# DO NOT EDIT THIS FILE!
# Generated by fulgens (https://www.npmjs.com/package/fulgens)
# Version: 0.0.19

trap cleanup 2
set -e

verbosePrint() {
	if [ "$VERBOSE" == "YES" ]; then
		echo -e "$1"
	fi
}

startDockerNetwork() {
	if [ -z "$DOCKER_NETWORKED_CHECKED" ]; then
		DOCKER_NETWORKED_CHECKED=YES
		if ! docker network ls | grep -s "citybuildernet"; then
			verbosePrint "Starting docker network citybuildernet on 10.83.252.0/24"
			docker network create -d bridge --subnet 10.83.252.0/24 --gateway 10.83.252.1 "citybuildernet"
		else
			verbosePrint "Docker network citybuildernet already running"
		fi
	fi
}

#---------------------
# START - CleanupBuilder

cleanup() {
	echo "****************************************************************"
	echo "Stopping software .....please wait...."
	echo "****************************************************************"
	set +e

	ALL_COMPONENTS=(pouchdb node)
	for componentToStop in "${ALL_COMPONENTS[@]}"; do
		IFS=',' read -r -a keepRunningArray <<<"$KEEP_RUNNING"
		componentFoundToKeepRunning=0
		for keepRunningToFindeElement in "${keepRunningArray[@]}"; do
			if [ "$componentToStop" == "$keepRunningToFindeElement" ]; then
				echo "Not stopping $componentToStop!"
				componentFoundToKeepRunning=1
			fi
		done
		if [ "$componentFoundToKeepRunning" -eq 0 ]; then

			if [ "$START_POUCHDB" = "YES" ]; then
				if [ "$componentToStop" == "pouchdb" ]; then
					echo "Stopping $componentToStop ..."

					if [ "$TYPE_SOURCE_POUCHDB" == "docker" ]; then
						docker rm -f $dockerContainerIDpouchdb
						rm -f .pouchdbPid
					fi

				fi
			fi

			if [ "$START_NODE" = "YES" ]; then
				if [ "$componentToStop" == "node" ]; then
					echo "Stopping $componentToStop ..."

					if [ "$TYPE_SOURCE_NODE" == "docker" ]; then
						docker rm -f $dockerContainerIDnode
						rm -f .nodePid
					fi

					if [ "$TYPE_SOURCE_NODE" == "local" ]; then
						ps -p $processIdnode >/dev/null && kill $processIdnode
						rm -f .nodePid
					fi

				fi
			fi

		fi
	done

	exit 0
}

# END - CleanupBuilder
#---------------------

#---------------------
# START - OptionsBuilder

usage="
usage: $(basename "$0") [options] [<component(s)>]

Options:
  -h                         show this help text
  -s                         skip any build
  -S                         skip consistency check against Fulgensfile
  -c [all|build]             clean local run directory, when a build is scheduled for execution it also does a full build
  -k [component]             keep comma sperarated list of components running
  -t [component:type:[path|version]] run component inside [docker] container, [download] component or [local] use installed component from path
  -v                         enable Verbose
  -V                         start VirtualBox via vagrant, install all dependencies, ssh into the VM and run
  -f                         tail the nodejs log at the end
  
Url: http://localhost:8080

Details for components:
pouchdb {Source:\"couchdb\", Default-Type:\"docker:latest\", Version-Info: \"Tested with 1.7 & 2.0\"}
  -t pouchdb:local #reuse a local, running CouchDB installation, does not start/stop this CouchDB
  -t pouchdb:docker:[TAG] #start docker, default tag latest, uses image https://hub.docker.com/r/oglimmer/pouchdb
node {Source:\"node\", Default-Type:\"local\", Version-Info: \"Tested with 10 & 11 (slim&alpine)\"}
  -t node:local #reuse a local node installation
  -t node:docker:[TAG] #start docker, default tag latest, uses image https://hub.docker.com/_/node
"

cd "$(
	cd "$(dirname "$0")"
	pwd -P
)"
BASE_PWD=$(pwd)

BUILD=local
while getopts ':hsSc:k:x:t:vVf' option; do
	case "$option" in
	h)
		echo "$usage"
		exit
		;;
	s) SKIP_BUILD=YES ;;
	S) SKIP_HASH_CHECK=YES ;;
	c)
		CLEAN=$OPTARG
		if [ "$CLEAN" != "all" -a "$CLEAN" != "build" ]; then
			echo "Illegal -c parameter" && exit 1
		fi
		;;
	k) KEEP_RUNNING=$OPTARG ;;
	x) SKIP_STARTING=$OPTARG ;;
	t) TYPE_SOURCE=$OPTARG ;;
	v) VERBOSE=YES ;;

	V) VAGRANT=YES ;;

	f) TAIL=YES ;;

	:)
		printf "missing argument for -%s\\n" "$OPTARG" >&2
		echo "$usage" >&2
		exit 1
		;;
	\\?)
		printf "illegal option: -%s\\n" "$OPTARG" >&2
		echo "$usage" >&2
		exit 1
		;;
	esac
done
shift $((OPTIND - 1))

if [ -z "$1" ]; then

	declare START_POUCHDB=YES

	declare START_NODE=YES

else
	ALL_COMPONENTS=(POUCHDB NODE)
	for comp in "$@"; do
		compUpper=$(echo $comp | awk '{print toupper($0)}')
		compValid=0
		for compDefined in "${ALL_COMPONENTS[@]}"; do
			if [ "$compDefined" = "$compUpper" ]; then
				compValid=1
			fi
		done
		if [ "$compValid" -eq 0 ]; then
			echo "Component $comp is invalid!"
			exit 1
		fi
		declare START_$compUpper=YES
	done
fi

# END - OptionsBuilder
#---------------------

if [ "$SKIP_HASH_CHECK" != "YES" ]; then
	if which md5 1>/dev/null; then
		declare SELF_HASH_MD5="d7ddf71db86fc1ca22b3d4b3df91e07a"
		declare SOURCE_FILES=(Fulgensfile Fulgensfile.js)
		for SOURCE_FILE in ${SOURCE_FILES[@]}; do
			declare SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"
			if [ -f "$SCRIPT_DIR/$SOURCE_FILE" ]; then
				if [ "$SELF_HASH_MD5" != "$(md5 -q $SCRIPT_DIR/$SOURCE_FILE)" ]; then
					echo "$SOURCE_FILE doesn not match!"
					exit 1
				fi
			fi
		done
	fi
fi

#---------------------
# START - DependencycheckBuilder

docker --version 1>/dev/null || exit 1
node --version 1>/dev/null || exit 1
npm --version 1>/dev/null || exit 1

# END - DependencycheckBuilder
#---------------------

# clean if requested
if [ -n "$CLEAN" ]; then
	if [ "$CLEAN" == "all" ]; then
		if [ "$VERBOSE" == "YES" ]; then echo "rm -rf localrun"; fi
		rm -rf localrun
	fi

fi

#---------------------
# START - GlobalVariablesBuilder

verbosePrint "DEFAULT: TYPE_SOURCE_POUCHDB=docker"
TYPE_SOURCE_POUCHDB=docker

verbosePrint "DEFAULT: TYPE_SOURCE_NODE=local"
TYPE_SOURCE_NODE=local

# END - GlobalVariablesBuilder
#---------------------

if [ "$(uname)" = "Linux" ]; then
	ADD_HOST_INTERNAL="--add-host host.docker.internal:$(ip -4 addr show scope global dev docker0 | grep inet | awk '{print $2}' | cut -d / -f 1)"
fi

mkdir -p localrun

f_deploy() {
	echo "No plugin defined f_deploy()"
}

#---------------------
# START - PrepareBuilder

if [ "$VAGRANT" == "YES" -a "$VAGRANT_IGNORE" != "YES" ]; then
	mkdir -p localrun
	cd localrun
	cat <<-EOF >Vagrantfile
		# -*- mode: ruby -*-
		# vi: set ft=ruby :
		
		Vagrant.configure("2") do |config|
		  config.vm.box = "ubuntu/xenial64"
		  config.vm.network "forwarded_port", guest: 8080, host: 8080
		  config.vm.synced_folder "../", "/share_host"
		  
		  config.vm.provider "virtualbox" do |vb|
		    vb.memory = "1536"
		    vb.cpus = 4
		  end
		  config.vm.provision "shell", inline: <<-SHELL
		  	
		    apt-get update    
		    
		      if [ "\$(cat /etc/*release|grep ^ID=)" = "ID=debian"  ]; then \\
		        if [ "\$(cat /etc/debian_version)" = "8.11" ]; then \\
		           curl -sL https://deb.nodesource.com/setup_6.x | bash -; apt-get -qy install nodejs docker.io; \\
		        elif [ "\$(cat /etc/debian_version)" = "9.5" ]; then \\
		          curl -sL https://deb.nodesource.com/setup_6.x | bash -; apt-get -qy install nodejs docker.io; \\
		        else curl -sL https://deb.nodesource.com/setup_10.x | bash -; apt-get -qy install nodejs docker.io; fi \\
		      elif [ "\$(cat /etc/*release|grep ^ID=)" = "ID=ubuntu"  ]; then \\
		        curl -sL https://deb.nodesource.com/setup_10.x | bash -; apt-get -qy install nodejs docker.io; \\
		      else \\
		        echo "only debian or ubuntu are supported."; \\
		        exit 1; \\
		      fi \\
		    
		    
		    
		    echo "Now continue with..."
		    echo "\$ cd /share_host"
		    echo "\$ sudo ./run_local.sh -f"
		    echo "...then browse to http://localhost:8080"
		  SHELL
		end
	EOF
	vagrant up
	if [ -f "../run_local.sh" ]; then
		vagrant ssh -c "cd /share_host && sudo ./run_local.sh -f"
	else
		echo "Save the fulgens output into a bash script (e.g. run_local.sh) and use it inside the new VM"
	fi
	exit 1
fi

# END - PrepareBuilder
#---------------------

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# CouchdbPlugin // pouchdb
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
verbosePrint "CouchdbPlugin // pouchdb"

if [ "$START_POUCHDB" = "YES" ]; then

	#---------------------
	# START - Plugin-PrepareComp

	IFS=',' read -r -a array <<<"$TYPE_SOURCE"
	for typeSourceElement in "${array[@]}"; do
		IFS=: read comp type pathOrVersion <<<"$typeSourceElement"

		if [ "$comp" == "pouchdb" ]; then
			TYPE_SOURCE_POUCHDB=$type
			if [ "$TYPE_SOURCE_POUCHDB" == "local" ]; then
				TYPE_SOURCE_POUCHDB_PATH=$pathOrVersion
			else
				TYPE_SOURCE_POUCHDB_VERSION=$pathOrVersion
			fi
		fi

	done

	if [ "$TYPE_SOURCE_POUCHDB" == "docker" ]; then
		if [ -z "$TYPE_SOURCE_POUCHDB_VERSION" ]; then
			TYPE_SOURCE_POUCHDB_VERSION=latest
		fi

	fi

	verbosePrint "TYPE_SOURCE_POUCHDB = $TYPE_SOURCE_POUCHDB // TYPE_SOURCE_POUCHDB_PATH = $TYPE_SOURCE_POUCHDB_PATH // TYPE_SOURCE_POUCHDB_VERSION = $TYPE_SOURCE_POUCHDB_VERSION"

	# END - Plugin-PrepareComp
	#---------------------

	if [ "$TYPE_SOURCE_POUCHDB" == "docker" ]; then
		if [ ! -f ".pouchdbPid" ]; then
			startDockerNetwork

			verbosePrint "docker run --rm -d -p 5984:5984 -m 50M --net=citybuildernet --name=pouchdb $ADD_HOST_INTERNAL   oglimmer/pouchdb:$TYPE_SOURCE_POUCHDB_VERSION"
			dockerContainerIDpouchdb=$(docker run --rm -d -p 5984:5984 \
				-m 50M \
				--net=citybuildernet --name=pouchdb $ADD_HOST_INTERNAL \
				oglimmer/pouchdb:$TYPE_SOURCE_POUCHDB_VERSION)
			echo "$dockerContainerIDpouchdb" >.pouchdbPid
		else
			dockerContainerIDpouchdb=$(<.pouchdbPid)
			echo "Reusing already running instance $dockerContainerIDpouchdb"
		fi
	fi
	if [ "$TYPE_SOURCE_POUCHDB" == "local" ]; then
		if [ -f ".pouchdbPid" ]; then
			echo "couchdb pouchdb running but started from different source type"
			exit 1
		fi
	fi

	while [ "$(curl --write-out %{http_code} --silent --output /dev/null http://localhost:5984)" != "200" ]; do
		echo "waiting for couchdb..."
		sleep 1
	done

fi

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# NodePlugin // node
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
verbosePrint "NodePlugin // node"

if [ "$START_NODE" = "YES" ]; then

	#---------------------
	# START - Plugin-PrepareComp

	IFS=',' read -r -a array <<<"$TYPE_SOURCE"
	for typeSourceElement in "${array[@]}"; do
		IFS=: read comp type pathOrVersion <<<"$typeSourceElement"

		if [ "$comp" == "node" ]; then
			TYPE_SOURCE_NODE=$type
			if [ "$TYPE_SOURCE_NODE" == "local" ]; then
				TYPE_SOURCE_NODE_PATH=$pathOrVersion
			else
				TYPE_SOURCE_NODE_VERSION=$pathOrVersion
			fi
		fi

	done

	if [ "$TYPE_SOURCE_NODE" == "docker" ]; then
		if [ -z "$TYPE_SOURCE_NODE_VERSION" ]; then
			TYPE_SOURCE_NODE_VERSION=latest
		fi

	fi

	verbosePrint "TYPE_SOURCE_NODE = $TYPE_SOURCE_NODE // TYPE_SOURCE_NODE_PATH = $TYPE_SOURCE_NODE_PATH // TYPE_SOURCE_NODE_VERSION = $TYPE_SOURCE_NODE_VERSION"

	# END - Plugin-PrepareComp
	#---------------------

	f_build() {
		verbosePrint "npm i --save-prod"

		npm i --save-prod

	}
	if [ "$SKIP_BUILD" != "YES" ]; then
		if [ -n "$CLEAN" ]; then
			verbosePrint "rm -rf node_modules/"
			rm -rf node_modules/
		fi
		f_build
	fi

	if [ "$TYPE_SOURCE_NODE" == "docker" ]; then
		#if [ -f ".nodePid" ] && [ "$(<.nodePid)" == "download" ]; then
		#  echo "node running but started from different source type"
		#  exit 1
		#fi
		if [ ! -f ".nodePid" ]; then
			startDockerNetwork

			if [ "$TYPE_SOURCE_POUCHDB" == "docker" ]; then
				REPLVAR_NODE_POUCHDB="pouchdb"
			elif [ "$TYPE_SOURCE_POUCHDB" == "local" ]; then
				REPLVAR_NODE_POUCHDB="host.docker.internal"
			fi

			mkdir -p localrun/91c32670

			cat <<EOT91c32670 >localrun/91c32670/citybuilder.properties

dbHost=http://$REPLVAR_NODE_POUCHDB:5984

db=http://$REPLVAR_NODE_POUCHDB:5984/citybuilder

dbSchema=citybuilder

httpPort=8080

httpHost=0.0.0.0

EOT91c32670

			verbosePrint "docker run --rm -d -p 8080:8080 -m 50M --net=citybuildernet --name=node $ADD_HOST_INTERNAL -v "$(pwd)/localrun/91c32670:/tmp/91c32670" -e CITYBUILDER_PROPERTIES="/tmp/91c32670/citybuilder.properties" -v $(pwd):/home/node/exec_env -w /home/node/exec_env node:$TYPE_SOURCE_NODE_VERSION node  ./startServer.js"
			dockerContainerIDnode=$(docker run --rm -d -p 8080:8080 \
				-m 50M \
				--net=citybuildernet --name=node $ADD_HOST_INTERNAL \
				-v "$(pwd)/localrun/91c32670:/tmp/91c32670" -e CITYBUILDER_PROPERTIES="/tmp/91c32670/citybuilder.properties" \
				-v "$(pwd)":/home/node/exec_env -w /home/node/exec_env node:$TYPE_SOURCE_NODE_VERSION node ./startServer.js)
			echo "$dockerContainerIDnode" >.nodePid
		else
			dockerContainerIDnode=$(<.nodePid)
			echo "Reusing already running instance $dockerContainerIDnode"
		fi
		tailCmd="docker logs -f $dockerContainerIDnode"
	fi

	if [ "$TYPE_SOURCE_NODE" == "local" ]; then
		#if [ -f ".nodePid" ]; then
		#  echo "node running but started from different source type"
		#  exit 1
		#fi
		if [ ! -f ".nodePid" ]; then
			cat <<-EOF >localrun/noint.js
				      process.on( "SIGINT", function() {} );
				      require('../startServer.js');
			EOF
			verbosePrint " node  localrun/noint.js >localrun/noint.out 2>&1 &"

			REPLVAR_NODE_POUCHDB="localhost"

			mkdir -p localrun/91c32670

			cat <<EOT91c32670 >localrun/91c32670/citybuilder.properties

dbHost=http://$REPLVAR_NODE_POUCHDB:5984

db=http://$REPLVAR_NODE_POUCHDB:5984/citybuilder

dbSchema=citybuilder

httpPort=8080

httpHost=0.0.0.0

EOT91c32670

			export CITYBUILDER_PROPERTIES="localrun/91c32670/citybuilder.properties"

			node localrun/noint.js >localrun/noint.out 2>&1 &
			processIdnode=$!
			echo "$processIdnode" >.nodePid
		else
			processIdnode=$(<.nodePid)
			echo "Reusing already running instance $processIdnode"
		fi
		tailCmd="tail -f localrun/noint.out"
	fi

fi

#---------------------
# START - WaitBuilder

# waiting for ctrl-c
echo "*************************************************************"
echo "**** SCRIPT COMPLETED, STARTUP IN PROGRESS ******************"
if [ "$TAIL" == "YES" ]; then
	echo "http://localhost:8080"
	echo "**** now tailing log: $tailCmd"
	$tailCmd
else
	echo "http://localhost:8080"
	echo "$tailCmd"
	echo "<return> to rebuild, ctrl-c to stop pouchdb, node"
	while true; do
		read </dev/tty
		f_build
		f_deploy
	done
fi

# END - WaitBuilder
#---------------------

