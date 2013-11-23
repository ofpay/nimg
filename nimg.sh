# nodeServer
DAEMON="node --stack_size=102400 app.js"
PIDFILE=NODEPID
NAME=NImg



case "$1" in
start)
     echo "Starting $NAME ..."
             nohup $DAEMON &
     echo $!> $PIDFILE
     echo "============================"
     echo "$NAME start ok "
	echo "============================"
               ;;
stop)
      echo "Stop  $NAME ..."
        pid=`cat "$PIDFILE"`
      echo $pid
      kill -9 $pid
         rm $PIDFILE
      echo "============================"
      echo "$NAME stop ok"
	  echo "============================"

               ;;
*)
echo "Usage: $0 {start|stop}"
esac
exit 0

