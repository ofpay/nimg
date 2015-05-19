#!/bin/bash
NAME=NImg



case $1 in
start)
     echo "Starting $NAME ..."
             pm2 start  /node/nimg/app.js  -i 4  --name nimg  -e /node/nimg/logs/err.log -o /node/nimg/logs/out.log
     echo "============================"
     echo "$NAME start ok "
        echo "============================"
               ;;
stop)
      echo "Stop  $NAME ..."
           pm2 stop nimg      

      echo "============================"
      echo "$NAME stop ok"
          echo "============================"

               ;;
*)
echo "Usage: $0 {start|stop}"
esac
exit 0
