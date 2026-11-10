; Installeur Inno Setup de clean-peek. Compilation : iscc installer\clean-peek.iss
; Le setup est cree dans installer\Output\clean-peek-Setup-1.0.0.exe
#define MyAppName "clean-peek"
#define MyAppVersion "1.0.0"
#define MyAppURL "https://github.com/Les-Doubles-A/clean-peek"

[Setup]
AppId={{D852FDED-990F-5872-BEE9-E9F7EE565659}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher=Les-Doubles-A
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}/releases
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=Output
OutputBaseFilename={#MyAppName}-Setup-{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=yes
InfoAfterFile=INSTALLATION.txt
Uninstallable=yes

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "INSTALLATION.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\manifest.json"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\background.js"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\popup.css"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\popup.html"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\popup.js"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\shared.js"; DestDir: "{app}\extension"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\{#MyAppName} - dossier de l'extension"; Filename: "{app}\extension"
Name: "{autoprograms}\{#MyAppName} - instructions"; Filename: "{app}\INSTALLATION.txt"

[Run]
Filename: "{app}\extension"; Description: "Ouvrir le dossier de l'extension"; Flags: postinstall shellexec skipifsilent nowait
