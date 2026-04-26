// js/banks/notify_ktb3.js

(function() {
    const fontPath = 'assets/fonts';
    let powerSavingMode = false;

    async function loadFonts() {
        const fonts = [
        new FontFace('SukhumvitSetThin', 'url(assets/fonts/SukhumvitSet-Thin.woff)'),
        new FontFace('SukhumvitSetText', 'url(assets/fonts/SukhumvitSet-Text.woff)'),
        new FontFace('SukhumvitSetLight', 'url(assets/fonts/SukhumvitSet-Light.woff)'),
        new FontFace('SukhumvitSetMedium', 'url(assets/fonts/SukhumvitSet-Medium.woff)'),
        new FontFace('SukhumvitSetSemiBold', 'url(assets/fonts/SukhumvitSet-SemiBold.woff)'),
        new FontFace('SukhumvitSetBold', 'url(assets/fonts/SukhumvitSet-Bold.woff)'),
        new FontFace('SukhumvitSetExtraBold', 'url(assets/fonts/SukhumvitSet-Extra%20Bold.woff)'),
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)'),
    ];

        return Promise.all(fonts.map(font => font.load().catch(e => console.warn(e)))).then(function(loadedFonts) {
            loadedFonts.forEach(function(font) {
                if (font) document.fonts.add(font);
            });
        });
    }

    function padZero(number) {
        return number < 10 ? '0' + number : number;
    }

    function formatDateWithDay(date) {
        const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
        const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        
        const d = new Date(date);
        if (isNaN(d)) return '-';
        return `${days[d.getDay()]}ที่ ${d.getDate()} ${months[d.getMonth()]}`;
    }

    function formatDate(date) {
        const d = new Date(date);
        if (isNaN(d)) return '-';
        const day = padZero(d.getDate());
        const month = padZero(d.getMonth() + 1);
        const year = (d.getFullYear() + 543).toString().slice(-2);
        return `${day}/${month}/${year}`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadFonts().then(() => {
            if (typeof window.updateDisplay === 'function') window.updateDisplay();
        }).catch(() => {
            if (typeof window.updateDisplay === 'function') window.updateDisplay();
        });
    });

    window.updateDisplay = function() {
        try {
            const datetime = document.getElementById('datetime')?.value || '-';
            const batteryLevel = document.getElementById('battery')?.value || '100';
            const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
            const money02 = document.getElementById('money02')?.value || '-';
            const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';
            
            const formattedDateWithDay = formatDateWithDay(datetime.substring(0, 10)); 
            const formattedTime = datetime.length > 11 ? datetime.substring(11, 16) : '-'; 
            const formattedTimePlusOne = datetimePlusOne; 
            
            const canvas = document.getElementById('canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            const drawUI = function() {
                try {
                    drawText(ctx, `${formattedTimePlusOne} น.`, 110, 33, 20, 'SFThonburiRegular', '#e5efee', 'right', 1.5, 3, 0, 0, 800, -0.25);
                    drawText(ctx, `บัญชีของฉัน`, 39, 195, 30, 'SukhumvitSetMedium', '#e5efee', 'left', 1.5, 3, 0, 0, 800, 0);
                    drawText(ctx, `${senderaccount1}`, 39, 235, 24, 'SukhumvitSetMedium', '#e5efee', 'left', 1.5, 3, 0, 0, 800, 0.25);
                    drawText(ctx, `ข้อมูล ณ เวลา ${formattedTime} น.`, 221, 609, 19.30, 'SukhumvitSetMedium', '#c2cacd', 'left', 1.5, 3, 0, 0, 800, 0.25);
                    drawText(ctx, `${money02}`, 295.5, 440, 42, 'SukhumvitSetMedium', '#ffffff', 'center', 40, 3, 0, 0, 430, -0.25);
                    drawBattery(ctx, batteryLevel, powerSavingMode);
                } catch(e) {}
            };

            const drawBackground = function() {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    drawUI();
                };
                img.onerror = () => {
                    ctx.fillStyle = '#1e293b'; 
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawUI();
                };
                img.src = 'assets/image/bs/backgroundEnter-K3.jpg';
            };

            drawBackground();
        } catch (error) {}
    };

    function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.shadowColor = shadowColor || 'transparent';
        ctx.shadowBlur = shadowBlur || 0;

        const paragraphs = text.split('<br>');
        let currentY = y;

        paragraphs.forEach(paragraph => {
            const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
            const words = [...segmenter.segment(paragraph)].map(segment => segment.segment);
            let lines = [];
            let currentLine = '';

            words.forEach((word) => {
                const testLine = currentLine + word;
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

                if (testWidth > maxWidth && currentLine !== '') {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            });
            if (currentLine) lines.push(currentLine.trimStart()); 

            lines.forEach((line, index) => {
                let currentX = x;
                if (align === 'center') {
                    currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
                } else if (align === 'right') {
                    currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
                }

                drawTextLine(ctx, line, currentX, currentY, letterSpacing);
                currentY += lineHeight;
                if (maxLines && index >= maxLines - 1) return;
            });
            currentY += lineHeight;
        });
    }

    function drawTextLine(ctx, text, x, y, letterSpacing) {
        if (!letterSpacing) {
            ctx.fillText(text, x, y);
            return;
        }
        const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
        const characters = [...segmenter.segment(text)].map(seg => seg.segment);
        let currentPosition = x;

        characters.forEach((char, index) => {
            const charCode = char.charCodeAt(0);
            const prevChar = index > 0 ? characters[index - 1] : null;

            const isUpperVowel = (charCode >= 0x0E34 && charCode <= 0x0E37);
            const isToneMark = (charCode >= 0x0E48 && charCode <= 0x0E4C);
            const isBeforeVowel = (charCode === 0x0E31);
            const isBelowVowel = (charCode >= 0x0E38 && charCode <= 0x0E3A);

            let yOffset = 0, xOffset = 0;

            if (isUpperVowel) { yOffset = -1; xOffset = 0; }
            if (isToneMark) {
                if (prevChar && ((prevChar.charCodeAt(0) >= 0x0E34 && prevChar.charCodeAt(0) <= 0x0E37) || prevChar.charCodeAt(0) === 0x0E31)) {
                    yOffset = -8; xOffset = 0;
                } else {
                    yOffset = 0; xOffset = -7;
                }
            }
            if (isBeforeVowel) { yOffset = -1; xOffset = 1; }
            if (isBelowVowel) { yOffset = 0; xOffset = -10; }

            ctx.fillText(char, currentPosition + xOffset, y + yOffset);

            if (!isToneMark && !isBeforeVowel && !isBelowVowel) {
                currentPosition += ctx.measureText(char).width + letterSpacing;
            } else {
                currentPosition += ctx.measureText(char).width;
            }
        });
    }

    function drawBattery(ctx, batteryLevel, powerSavingMode) {
        ctx.lineWidth = 2; 
        ctx.strokeStyle = '#9b9b9b';
        ctx.fillStyle = '#ffffff';

        let batteryColor = '#28bf2b'; 
        if (batteryLevel <= 20) {
            batteryColor = '#ff0000';
        } else if (powerSavingMode) {
            batteryColor = '#fccd0e'; 
        }

        const fillWidth = (batteryLevel / 100) * 26;
        const x = 523, y = 20.0, height = 12.8, radius = 3; 

        ctx.fillStyle = batteryColor; 
        ctx.beginPath(); 
        ctx.moveTo(x, y + radius); 
        ctx.lineTo(x, y + height - radius); 
        ctx.arcTo(x, y + height, x + radius, y + height, radius); 
        ctx.lineTo(x + fillWidth - radius, y + height); 
        ctx.arcTo(x + fillWidth, y + height, x + fillWidth, y + height - radius, radius); 
        ctx.lineTo(x + fillWidth, y + radius); 
        ctx.arcTo(x + fillWidth, y, x + fillWidth - radius, y, radius); 
        ctx.lineTo(x + radius, y); 
        ctx.arcTo(x, y, x, y + radius, radius); 
        ctx.closePath(); 
        ctx.fill(); 

        drawText(ctx, `${batteryLevel}`, x + 26 / 2, y + height / 1.21, 13, 'SFThonburiSemiBold', '#ffffff', 'center', 1, 1, 0, 0, 100, -1);
    }

    window.downloadImage = function() {
        const canvas = document.getElementById('canvas');
        if(!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'notify_ktb3.png';
        link.click();
    };
})();