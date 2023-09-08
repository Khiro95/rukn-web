النسخة العربية متوفرة [هنا](README.ar.md)

# Rukn App

Rukn is an easy tool that allows creating high-quality images which contain Arabic verse(s) from Quran and/or English translation. It makes blending the texts with a background image (or a solid color background) a matter of few clicks! The texts can be styled to have custom color and size to fit the desired design and they can be positioned exactly where needed.

## Windows

Altought the web app can be used on any platform, there is also a WPF version of the app available [here](https://github.com/khiro95/rukn-app).

## Build

Requires [Node.js](https://nodejs.org/) v14.15 and above.

## How to use

### Step 1: Background

- If you want to use an image, click on **Load Image** button in the left panel and select it. This will set board size automatically.
- If you wish to use solid color background, choose the desired color from the color-picker in the left panel then set the desired width and height.

### Step 2: Verse(s)

- From the header panel, select the desired chapter (Surah) then select the desired verse (ayah) number.
- If you want a range of verses, click on the checkbox near the field **To** then select the verse number at which the range stop.

### Step 3: Text(s)

- From the right panel, toggle the visibility of the texts by clicking on the corresponding element.

    *(**Note:** elements of reference texts are not clickable)*

### Step 4: Style

- In the center area, click on a text to select it, then use the left panel to apply necessary styles (color, font size, and alignment).
- Some texts has special styles. For example the Arabic text support decorated parentheses. These special styles can be found in the left panel.

### Step 5: Position and size

- Use the mouse/touch to drag the selected text in center area. You can also use keyboard arrows keys to move the selected text, hold the <kbd>Shift</kbd> key down to move faster.
- Use the handles of the selection box to resize the text container. Double-click on the selection box to make the container fit the exact width of the text.

    *(**Note:** Double-clicking on the selection box will only remove any additional horizontal space)*

### Step 6: Save

- Once you are done, click on **Save** button at the bottom panel to save the result as a PNG image.
- You can click on **Copy** to copy the result, as a PNG image, to the clipboard.

    *(**Note:** Firefox doesn't support copying data to the clipboard)*

## Notes

- Actually, the only supported narration is *Hafs on the authority of Asim*.
- The app uses *Saheeh International* for English translation.

## Credit

- [King Fahd Glorious Qur'an Printing Complex (KFGQPC)](https://qurancomplex.gov.sa/): for providing the Uthmanic Hafs font alongside the compatible Quran text.
- [Tanzil](https://tanzil.net/): for providing the Quran metadata and English translation.
- [Kaleam](https://www.kaleam.com/): for the help with Rukn logo (the Arabic word).