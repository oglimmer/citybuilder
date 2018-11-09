#!/usr/bin/env bash

trap cleanup 2
set -e



#------------
# FunctionsBuilder
#------------







#------------
# CleanupBuilder
#------------


cleanup()
{
  echo "****************************************************************"
  echo "Stopping software .....please wait...."
  echo "****************************************************************"

  ALL_COMPONENTS=(couchdb node)
  for keepRunningAllElement in "${ALL_COMPONENTS[@]}"; do
    IFS=',' read -r -a array <<< "$KEEP_RUNNING"
    found=0
    for keepRunningToFindeElement in "${array[@]}"; do
      if [ "$keepRunningAllElement" == "$keepRunningToFindeElement" ]; then
        echo "Not stopping $keepRunningAllElement!"
        found=1
      fi
    done
    if [ "$found" -eq 0 ]; then
      
      if [ "$keepRunningAllElement" == "couchdb" ]; then
        echo "Stopping $keepRunningAllElement ..."
        
        if [ "$TYPE_SOURCE_COUCHDB" == "docker" ]; then
         docker rm -f $dockerContainerIDcouchdb
         rm -f .couchdbPid
        fi
        
      fi
      
      if [ "$keepRunningAllElement" == "node" ]; then
        echo "Stopping $keepRunningAllElement ..."
        
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
  done

  exit 0
}







#------------
# OptionsBuilder
#------------


usage="$(basename "$0") - Builds, deploys and run ${name}
where:
  -h                         show this help text
  -s                         skip any build
  -c [all|build]             clean local run directory, when a build is scheduled for execution it also does a full build
  -k [component]             keep comma sperarated list of components running
  -t [component:type:[path|version]] run component inside [docker] container, [download] component (default) or [local] use installed component from path
  -V                         enable Verbose
  -v                         start VirtualBox via vagrant, install all dependencies, ssh into the VM and run
  -f                         tail the nodejs log at the end
  

Details:
 -t couchdb:local #reuse a local, running CouchDB installation, does not start/stop this CouchDB
 -t couchdb:docker:[1.7|2] #start docker image couchdb:X
 -t node:local #reuse a local node installation
 -t node:docker:[6|8|10] #start docker image node:X

"

cd "$(cd "$(dirname "$0")";pwd -P)"
BASE_PWD=$(pwd)

BUILD=local
while getopts ':hsc:k:t:Vvf' option; do
  case "$option" in
    h) echo "$usage"
       exit;;
    s) SKIP_BUILD=YES;;
    c) 
       CLEAN=$OPTARG
       if [ "$CLEAN" != "all" -a "$CLEAN" != "build" ]; then
         echo "Illegal -c parameter" && exit 1
       fi
       ;;
    k) KEEP_RUNNING=$OPTARG;;
    t) TYPE_SOURCE=$OPTARG;;
    V) VERBOSE=YES;;

    v) VAGRANT=YES;;

    f) TAIL=YES;;

    :) printf "missing argument for -%s\\n" "$OPTARG" >&2
       echo "$usage" >&2
       exit 1;;
   \\?) printf "illegal option: -%s\\n" "$OPTARG" >&2
       echo "$usage" >&2
       exit 1;;
  esac
done
shift $((OPTIND - 1))
TYPE_PARAM="$1"






#------------
# DependencycheckBuilder
#------------

docker --version 1>/dev/null || exit 1; 
node --version 1>/dev/null || exit 1; 
npm --version 1>/dev/null || exit 1; 




# clean if requested
if [ -n "$CLEAN" ]; then
  if [ "$CLEAN" == "all" ]; then
    if [ "$VERBOSE" == "YES" ]; then echo "rm -rf localrun"; fi
    rm -rf localrun
  fi
  

#------------
# CleanBuilder
#------------




fi



#------------
# GlobalVariablesBuilder
#------------


      if [ "$VERBOSE" == "YES" ]; then echo "DEFAULT: TYPE_SOURCE_COUCHDB=docker"; fi
      TYPE_SOURCE_COUCHDB=docker
    

      if [ "$VERBOSE" == "YES" ]; then echo "DEFAULT: TYPE_SOURCE_NODE=local"; fi
      TYPE_SOURCE_NODE=local
    



mkdir -p localrun



#------------
# PrepareBuilder
#------------



if [ "$VAGRANT" == "YES" -a "$VAGRANT_IGNORE" != "YES" ]; then
  mkdir -p localrun
  cd localrun
  cat <<-EOF > Vagrantfile
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/xenial64"
  config.vm.network "forwarded_port", guest: 8080, host: 8080
  config.vm.synced_folder "../", "/share_host"
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
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
    echo "...then browse to http://localhost:8080/XXXX"
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








#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# CouchdbPlugin // couchdb
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if [ -n "$VERBOSE" ]; then echo "CouchdbPlugin // couchdb"; fi




#------------
# Plugin-PrepareComp
#------------




IFS=',' read -r -a array <<< "$TYPE_SOURCE"
for typeSourceElement in "${array[@]}"; do
  IFS=: read comp type pathOrVersion <<< "$typeSourceElement"

  if [ "$comp" == "couchdb" ]; then
    TYPE_SOURCE_COUCHDB=$type
    if [ "$TYPE_SOURCE_COUCHDB" == "local" ]; then
      TYPE_SOURCE_COUCHDB_PATH=$pathOrVersion
    else
      TYPE_SOURCE_COUCHDB_VERSION=$pathOrVersion
    fi
  fi

done



if [ "$TYPE_SOURCE_COUCHDB" == "docker" ]; then
  if [ -z "$TYPE_SOURCE_COUCHDB_VERSION" ]; then
    TYPE_SOURCE_COUCHDB_VERSION=1.7
  fi
    
fi



if [ "$VERBOSE" == "YES" ]; then
  echo "TYPE_SOURCE_COUCHDB = $TYPE_SOURCE_COUCHDB // TYPE_SOURCE_COUCHDB_PATH = $TYPE_SOURCE_COUCHDB_PATH // TYPE_SOURCE_COUCHDB_VERSION = $TYPE_SOURCE_COUCHDB_VERSION"
fi







#------------
# Plugin-GetSource
#------------







#------------
# Plugin-PreBuild
#------------







#------------
# Plugin-Build
#------------







#------------
# Plugin-PostBuild
#------------







#------------
# Plugin-PreStart
#------------







#------------
# Plugin-Start
#------------





if [ "$TYPE_SOURCE_COUCHDB" == "docker" ]; then
  # run in docker
  if [ ! -f ".couchdbPid" ]; then
    
    if [ "$VERBOSE" == "YES" ]; then echo "docker run --rm -d -p 5984:5984 $dockerCouchdbExtRef   couchdb:$TYPE_SOURCE_COUCHDB_VERSION"; fi
    dockerContainerIDcouchdb=$(docker run --rm -d -p 5984:5984 $dockerCouchdbExtRef \
        couchdb:$TYPE_SOURCE_COUCHDB_VERSION)
    echo "$dockerContainerIDcouchdb">.couchdbPid
  else
    dockerContainerIDcouchdb=$(<.couchdbPid)
  fi
fi
if [ "$TYPE_SOURCE_COUCHDB" == "local" ]; then
  if [ -f ".couchdbPid" ]; then
    echo "couchdb couchdb running but started from different source type"
    exit 1
  fi
fi



#------------
# Plugin-PostStart
#------------





while [ "$(curl --write-out %{http_code} --silent --output /dev/null http://localhost:5984)" != "200" ]; do
  echo "waiting for couchdb..."
  sleep 1
done





#------------
# Plugin-LeaveComp
#------------







#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# NodePlugin // node
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if [ -n "$VERBOSE" ]; then echo "NodePlugin // node"; fi




#------------
# Plugin-PrepareComp
#------------




IFS=',' read -r -a array <<< "$TYPE_SOURCE"
for typeSourceElement in "${array[@]}"; do
  IFS=: read comp type pathOrVersion <<< "$typeSourceElement"

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
    TYPE_SOURCE_NODE_VERSION=10
  fi
    
fi



if [ "$VERBOSE" == "YES" ]; then
  echo "TYPE_SOURCE_NODE = $TYPE_SOURCE_NODE // TYPE_SOURCE_NODE_PATH = $TYPE_SOURCE_NODE_PATH // TYPE_SOURCE_NODE_VERSION = $TYPE_SOURCE_NODE_VERSION"
fi







#------------
# Plugin-GetSource
#------------







#------------
# Plugin-PreBuild
#------------







#------------
# Plugin-Build
#------------





f_build() {
  if [ "$VERBOSE" == "YES" ]; then echo "npm i --save-prod"; fi
  
  npm i --save-prod
  
}
if [ "$SKIP_BUILD" != "YES" ]; then
  if [ -n "$CLEAN" ]; then
    if [ "$VERBOSE" == "YES" ]; then echo "rm -rf node_modules/"; fi
    rm -rf node_modules/
  fi
  f_build        
fi



#------------
# Plugin-PostBuild
#------------







#------------
# Plugin-PreStart
#------------







#------------
# Plugin-Start
#------------





if [ "$TYPE_SOURCE_NODE" == "docker" ]; then
  #if [ -f ".nodePid" ] && [ "$(<.nodePid)" == "download" ]; then
  #  echo "node running but started from different source type"
  #  exit 1
  #fi
  if [ ! -f ".nodePid" ]; then
    mkdir -p localrun/91c32670


if [ "$TYPE_SOURCE_COUCHDB" == "docker" ]; then
  dockerNodeExtRef="--link $dockerContainerIDcouchdb"
  
  REPLVARdbHost="http://$dockerContainerIDcouchdb:5984"
  
  REPLVARdb="http://$dockerContainerIDcouchdb:5984/citybuilder"
  
elif [ "$TYPE_SOURCE_COUCHDB" == "local" ]; then
  if [ "$(uname)" != "Linux" ]; then 
    
    REPLVARdbHost="http://host.docker.internal:5984"
    
    REPLVARdb="http://host.docker.internal:5984/citybuilder"
    
  else 
    dockerNodeExtRef="--net=host"
  fi
fi



mkdir -p localrun/91c32670

cat <<EOT91c32670 > localrun/91c32670/citybuilder.properties

	dbSchema=citybuilder

	httpPort=8080

	httpHost=0.0.0.0


	dbHost=$REPLVARdbHost

	db=$REPLVARdb

EOT91c32670


    if [ -n "$VERBOSE" ]; then echo "docker run --rm -d $dockerNodeExtRef -p 8080:8080 -v "$(pwd)/localrun/91c32670:/tmp/91c32670" -e CITYBUILDER_PROPERTIES="/tmp/91c32670/citybuilder.properties"  -v $(pwd):/home/node/exec_env -w /home/node/exec_env node:$TYPE_SOURCE_NODE_VERSION node  ./startServer.js"; fi
    dockerContainerIDnode=$(docker run --rm -d $dockerNodeExtRef -p 8080:8080 \
        -v "$(pwd)/localrun/91c32670:/tmp/91c32670" -e CITYBUILDER_PROPERTIES="/tmp/91c32670/citybuilder.properties"  \
        -v "$(pwd)":/home/node/exec_env -w /home/node/exec_env node:$TYPE_SOURCE_NODE_VERSION node  ./startServer.js)
    echo "$dockerContainerIDnode">.nodePid
  else
    dockerContainerIDnode=$(<.nodePid)
  fi
  tailCmd="docker logs -f $dockerContainerIDnode"
fi

if [ "$TYPE_SOURCE_NODE" == "local" ]; then
  #if [ -f ".nodePid" ]; then
  #  echo "node running but started from different source type"
  #  exit 1
  #fi
  if [ ! -f ".nodePid" ]; then
    cat <<-'    EOF' > localrun/noint.js
      process.on( "SIGINT", function() {} );
      require('../startServer.js');
    EOF
    if [ -n "$VERBOSE" ]; then echo " node  localrun/noint.js >localrun/noint.out 2>&1 &"; fi
    
      REPLVARdbHost="http://localhost:5984"
REPLVARdb="http://localhost:5984/citybuilder"
      
mkdir -p localrun/91c32670

cat <<EOT91c32670 > localrun/91c32670/citybuilder.properties

	dbSchema=citybuilder

	httpPort=8080

	httpHost=0.0.0.0


	dbHost=$REPLVARdbHost

	db=$REPLVARdb

EOT91c32670

  export CITYBUILDER_PROPERTIES="localrun/91c32670/citybuilder.properties"
    
     node  localrun/noint.js >localrun/noint.out 2>&1 & 
    processIdnode=$!
    echo "$processIdnode">.nodePid
  else
    processIdnode=$(<.nodePid)
  fi
  tailCmd="tail -f localrun/noint.out"
fi





#------------
# Plugin-PostStart
#------------







#------------
# Plugin-LeaveComp
#------------








#------------
# WaitBuilder
#------------

# waiting for ctrl-c
if [ "$TAIL" == "YES" ]; then
  $tailCmd
else
  echo "$tailCmd"
  echo "<return> to rebuild, ctrl-c to stop couchdb, node"
  while true; do
    read </dev/tty
    f_build
    f_deploy
  done
fi




