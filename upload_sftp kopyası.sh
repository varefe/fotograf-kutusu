#!/usr/bin/expect -f

set timeout 30
set HOST "fotografkutusu.com"
set USER "pfotogex"
set PASS "fot539IJdh}"
set REMOTE_DIR "public_html"
set LOCAL_DIR "/Users/varefe/Desktop/yazılım dosyaları/fotograf-proje/dist"

spawn sftp -o StrictHostKeyChecking=no ${USER}@${HOST}

expect {
    "password:" {
        send "${PASS}\r"
    }
    "Password:" {
        send "${PASS}\r"
    }
    timeout {
        puts "Bağlantı zaman aşımına uğradı"
        exit 1
    }
}

expect "sftp>"
send "cd ${REMOTE_DIR}\r"

expect "sftp>"
send "put -r ${LOCAL_DIR}/* .\r"

expect "sftp>"
send "quit\r"

expect eof


