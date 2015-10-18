Tapez le mot de passe du Keystore :  ch@...
Ressaisissez le nouveau mot de passe :
Quels sont vos pr?nom et nom ?
  [Unknown] :  jeremy chaufourier
Quel est le nom de votre unit? organisationnelle ?
  [Unknown] :
Quelle est le nom de votre organisation ?
  [Unknown] :
Quel est le nom de votre ville de r?sidence ?
  [Unknown] :
Quel est le nom de votre ?tat ou province ?
  [Unknown] :
Quel est le code de pays ? deux lettres pour cette unit? ?
  [Unknown] :  fr
Est-ce CN=jeremy chaufourier, OU=Unknown, O=Unknown, L=Unknown, ST=Unknown, C=fr ?
  [non] :  oui

G?n?ration d'une paire de cl?s RSA de 2?048 bits et d'un certificat autosign? (SHA1withRSA) d'une validit? de 10?000 jours
    pour : CN=jeremy chaufourier, OU=Unknown, O=Unknown, L=Unknown, ST=Unknown, C=fr
Sp?cifiez le mot de passe de la cl? pour <manganext>
    (appuyez sur Entr?e s'il s'agit du mot de passe du Keystore) :
[Stockage de manganext.keystore]


cordova build --release android
keytool -genkey -v -keystore manganext.keystore -alias manganext -keyalg RSA -keysize 2048 -validity 10000
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore manganext.keystore android-release-unsigned.apk manganext
ou
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore manganext.keystore android-armv7-release-unsigned.apk manganext

~/Library/Android/sdk/build-tools/23.0.0_rc3/zipalign -v 4 android-release-unsigned.apk manganext.apk
ou
~/Library/Android/sdk/build-tools/23.0.0_rc3/zipalign -v 4 android-armv7-release-unsigned.apk manganext.apk
