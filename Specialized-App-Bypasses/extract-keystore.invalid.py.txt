#!/usr/bin/python3
'''
usage: ./frida-extract-keystore.py
Once the keystore(s) have been exported you have to convert them to PKCS12 using keytool
NOTE: Updated Frida 17 fork here https:'''
import frida, sys, time
app_name = 'com.app.mobile'
i = 0
ext = ''
def on_message(message, data):
global i, ext
if (message['type'] == 'send' and 'event' in message['payload']):
if (message['payload']['event'] == '+found'):
i += 1
print("\n[+] Hooked keystore" + str(i) + "...")
elif (message['payload']['event'] == '+type'):
print("  [+] Cert Type: " + ''.join(message['payload']['certType']))
if (message['payload']['certType'] == 'PKCS12'):
ext = '.jks'
elif (message['payload']['event'] == '+pass'):
print("  [+] Password: " + ''.join(message['payload']['password']))
elif (message['payload']['event'] == '+write'):
print("  [+] Writing to file: keystore" + str(i) + ext)
f = open('keystore' + str(i) + ext, 'wb')
f.write(bytes.fromhex(message['payload']['cert']))
f.close()
else:
print(message)
jscode = """
setTimeout(function() {
Java.perform(function () {
var keyStoreLoadStream = Java.use('java.security.KeyStore')['load'].overload('java.io.InputStream', '[C');
keyStoreLoadStream.implementation = function(stream, charArray) {
if (stream == null) {
this.load(stream, charArray);
return;
}
send({event: '+found'});
var hexString = readStreamToHex (stream);
send({event: '+type', certType: this.getType()});
send({event: '+pass', password: charArray});
send({event: '+write', cert: hexString});
this.load(stream, charArray);
}
});
},0);
function readStreamToHex (stream) {
var data = [];
var byteRead = stream.read();
while (byteRead != -1)
{
data.push( ('0' + (byteRead & 0xFF).toString(16)).slice(-2) );
byteRead = stream.read();
}
stream.close();
return data.join('');
}
"""
print("[.] Attaching to device...")
try:
device = frida.get_usb_device()
except:
print("[-] Can't attach. Is the device connected?")
sys.exit()
print("[.] Spawning the app...")
try:
pid = device.spawn(app_name)
device.resume(pid)
time.sleep(1)
except:
print("[-] Can't spawn the App. Is filename correct?")
sys.exit()
print("[.] Attaching to process...")
try:
process = device.attach(pid)
except:
print("[-] Can't connect to App.")
sys.exit()
print("[.] Launching js code...")
print("  (run the app until needed, close it and then kill this script)")
script = process.create_script(jscode)
script.on('message', on_message)
script.load()
try:
sys.stdin.read()
except KeyboardInterrupt:
print ("\nExiting now")
exit(0)
