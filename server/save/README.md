**This folder contains auto generated files. DO NOT MODIFY the content unless you know what you are doing** (except for the `paths` file, see below).



------



#### paths.json

You can edit this file based on the paths on your system. Windows users should use `\\` (e.g. `"C:\\Users\\U_NAME"`).



- GHCi Path
- SCLang and SCSynth Paths
- SCLang Config File (`sclang_conf.yaml`)
- Tidal and SC Start files in `Siren/config/` folder (`tidal-boot-default.hs` and `scd-start-default.scd`). Please use absolute paths for these files.



MacOS example:

```json
{
     "userpath":"/Users/USER_NAME/",
     "ghcipath":"/Library/Frameworks/GHC.framework/Versions/8.2.1-x86_64/usr/bin/ghci-8.2.1",
     "sclang":"/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/sclang",
     "scsynth":"/Applications/SuperCollider/SuperCollider.app/Contents/Resources/scsynth",
     "sclang_conf":"/Users/USER_NAME/Library/Application Support/SuperCollider/sclang_conf.yaml",
     "tidal_boot":"/Users/USER_NAME/Documents/Git/Siren/config/tidal-boot-default.hs",
     "scd_start":"/Users/USER_NAME/Documents/Git/Siren/config/scd-start-default.scd"
}
```

Windows example:

```json
{
    "userpath":"C:\\Users\\USER_NAME",
	"ghcipath": "C:\\Program Files\\Haskell Platform\\8.2.2\\bin\\ghci.exe",
 	"sclang": "C:\\Program Files\\SuperCollider-3.9.3\\sclang.exe",
 	"scsynth": "C:\\Program Files\\SuperCollider-3.9.3\\scsynth.exe",
 	"sclang_conf": "C:\\Users\\USER_NAME\\AppData\\Local\\SuperCollider\\sclang_conf.yaml",
	"tidal_boot":"C:\\GitHub\\Siren\\config\\tidal-boot-default.hs",
	"scd_start":"C:\\GitHub\\Siren\\config\\scd-start-default.scd"
}
```



