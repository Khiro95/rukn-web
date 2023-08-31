const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const resourcesPath = path.resolve(process.cwd(), process.argv[2] || 'src/locales_res');
const outputPath = path.resolve(process.cwd(), process.argv[3] || 'locales');

const files = fs.readdirSync(resourcesPath).filter(file => /^Resources(\.[a-z]{2})*\.resx$/.test(file));

if (files.length === 0) {
    console.log('There were no locales resources to convert in\n' + resourcesPath);
    return;
}

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
}

const locMap = new Map();
locMap.set('en', {
    lang: 'en',
    Close: 'Close',
    Layers: 'Layers',
    Loading: 'Loading',

    runtime_resource: {
        InsertName: 'Enter a file name. (Leave it empty for random name)',
        Error_ClipboardNotSupported: 'This browser doesn\'t support copying data to the clipboard.',
        Error_FetchQuranFailed: 'Could not fetch Quran data: {0}',
    }
});
locMap.set('ar', {
    lang: 'ar',
    Close: 'إغلاق',
    Layers: 'طبقات',
    Loading: 'تحميل',

    runtime_resource: {
        InsertName: 'قم بإدخال اسم للملف. (اتركه فارغا للحصول على اسم عشوائي)',
        Error_ClipboardNotSupported: 'هذا المتصفح لا يدعم نسخ البيانات إلى الحافظة.',
        Error_FetchQuranFailed: 'لم يتم احضار بيانات القرآن: {0}',
    }
});

for (const file of files) {
    if (/^Resources(\.[a-z]{2})*\.resx$/.test(file)) {
        console.log("Converting " + file + '...');

        const lang = file.replace('Resources', '').replace('.resx', '').replace('.', '') || 'en';
        const data = fs.readFileSync(path.join(resourcesPath, file,), 'utf-8');
        
        const options = {
            ignoreAttributes: false,
            attributeNamePrefix : "@_"
        };
        const parser = new XMLParser(options);
        const obj = parser.parse(data);
        const locObj = locMap.get(lang);
        for (const entry of obj.root.data) {
            const name = entry['@_name'].replaceAll('.', '_');
            if (['ArabicReference', 'ArabicText', 'EnglishReference', 'EnglishTranslation'].includes(name) || name.startsWith('Error')) {
                locObj.runtime_resource[name] = entry.value;
            }
            else {
                locObj[name] = entry.value;
            }
        }

        fs.writeFileSync(path.join(outputPath, lang + '.json'), JSON.stringify(locObj, null, 4));
    }
}

const keysObj = Object.entries(locMap.get('ar').runtime_resource).reduce((k, [key, value]) => { k[key] = key; return k; }, {})
fs.writeFileSync(path.join(outputPath, 'keys.json'), JSON.stringify(keysObj, null, 4));