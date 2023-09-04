// convert a number to its string representation of western arabic equivalent or a custom string using custom seed
function convertNum(num, seed = '\ufd50') {
    let chars = Array.from(String(num), Number).map(d => seed.charCodeAt(0) + d);
    if (seed === '\ufd50') {
        chars = chars.reverse();
    }
    return String.fromCharCode(...chars);
}

// convert color from format 'rgb(r, g, b)' to hex
function colorToHex(rgb) {
    return '#' + rgb
        .match(/\d+/g)
        .map(n => Number(n).toString(16).padStart(2, '0'))
        .join('');
}

// Based on: https://fjolt.com/article/html-canvas-how-to-wrap-text
// @description: wrapText wraps HTML canvas text onto a canvas of fixed width
// @param ctx - the context for the canvas we want to wrap text on
// @param text - the text we want to wrap.
// @param x - the X starting point of the text on the canvas.
// @param y - the Y starting point of the text on the canvas.
// @param maxWidth - the width at which we want line breaks to begin - i.e. the maximum width of the canvas.
// @param lineHeight - the height of each line, so we can space them below each other.
// @returns an array of [ lineText, x, y ] for all lines
function wrapText(ctx, text, x, y, maxWidth, lineHeight = null) {
    const lines = text.split('\n');
    if (lines.length === 0) {
        return;
    }
    const result = [];
    // Get font lineheight to measure vertical offset
    const metrics = ctx.measureText(' ');
    const fontLineHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    // If lineHeight is not provided then we use default from font
    lineHeight = lineHeight ?? fontLineHeight;
    const verticalOffset = metrics.fontBoundingBoxAscent + Math.floor((lineHeight - fontLineHeight) / 2);
    for (let line of lines) {
        const wrapped = wrapLine(ctx, line, x, y, maxWidth, lineHeight, verticalOffset);
        result.push(...wrapped);
        y += lineHeight * wrapped.length;
    }
    return result;
}
function wrapLine(ctx, text, x, y, maxWidth, lineHeight, verticalOffset) {
    // First, start by splitting all of our text into words, but splitting it into an array split by spaces
    let words = text.split(' ');
    let line = ''; // This will store the text of the current line
    let testLine = ''; // This will store the text when we add a word, to test if it's too long
    let lineArray = []; // This is an array of lines, which the function will return
    
    // Lets iterate over each word
    for (let n = 0; n < words.length; n++) {
        // Create a test line, and measure it..
        testLine += (testLine.length > 0 ? ' ' : '') + words[n];
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        // If the width of this test line is more than the max width
        if (testWidth > maxWidth && n > 0) {
            // Then the line is finished, push the current line into "lineArray"
            lineArray.push([line, x, y + verticalOffset]);
            // Increase the line height, so a new line is started
            y += lineHeight;
            // Update line and test line to use this word as the first word on the next line
            line = words[n];
            testLine = words[n];
        }
        else {
            // If the test line is still less than the max width, then add the word to the current line
            line += (line.length > 0 ? ' ' : '') + words[n];
        }
        // If we never reach the full max width, then there is only one line.. so push it into the lineArray so we return something
        if (n === words.length - 1) {
            lineArray.push([line, x, y + verticalOffset]);
        }
    }
    // Return the line array
    return lineArray;
}

export default { convertNum, colorToHex, wrapText }