 (function() {
    let qrCodeImage = null;
    let powerSavingMode = false;
    let currentBgSrc = '';
    const imageCache = {};

    function getCachedImage(src) {
        if (!src) return null;
        if (!imageCache[src]) {
            const img = new Image();
            img.onload = () => {
                if (typeof window.updateDisplay === 'function') window.updateDisplay();
            };
            img.src = src;
            imageCache[src] = img;
        }
        return imageCache[src];
    }

    getCachedImage('assets/image/bs/backgroundEnter-KT6.1.jpg');
    getCachedImage('assets/image/icon/icona.png');

    function loadFonts() {
        const fonts = [
            new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
            new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
            new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
            new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)'),
            new FontFace('SarabunThin', 'url(assets/fonts/Sarabun-Thin.woff)'),
            new FontFace('SarabunExtraLight', 'url(assets/fonts/Sarabun-ExtraLight.woff)'),
            new FontFace('SarabunLight', 'url(assets/fonts/Sarabun-Light.woff)'),
            new FontFace('SarabunRegular', 'url(assets/fonts/Sarabun-Regular.woff)'),
            new FontFace('SarabunMedium', 'url(assets/fonts/Sarabun-Medium.woff)'),
            new FontFace('SarabunSemiBold', 'url(assets/fonts/Sarabun-SemiBold.woff)'),
            new FontFace('SarabunBold', 'url(assets/fonts/Sarabun-Bold.woff)'),
            new FontFace('SarabunExtraBold', 'url(assets/fonts/Sarabun-ExtraBold.woff)')
        ];

        return Promise.allSettled(fonts.map(font => font.load())).then(results => {
            results.forEach(result => {
                if (result.status === 'fulfilled') document.fonts.add(result.value);
            });
        });
    }

    window.onload = function() {
        setCurrentDateTime();
        loadFonts().then(() => {
            document.fonts.ready.then(() => {
                if (typeof window.updateDisplay === 'function') window.updateDisplay();
            });
        }).catch(() => {
            if (typeof window.updateDisplay === 'function') window.updateDisplay();
        });
    };

    function setCurrentDateTime() {
        const now = new Date();
        const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
        
        const dt = document.getElementById('datetime');
        if (dt) dt.value = localDateTime.substring(0, 16);
        const dt1 = document.getElementById('datetime1');
        if (dt1) dt1.value = localDateTime.substring(0, 16);

        const oneMinuteLater = new Date(now.getTime() + 60000);
        const hours = oneMinuteLater.getHours().toString().padStart(2, '0');
        const minutes = oneMinuteLater.getMinutes().toString().padStart(2, '0');
        const dtPlusOne = document.getElementById('datetime_plus_one');
        if (dtPlusOne) dtPlusOne.value = `${hours}:${minutes}`;
    }

    function formatDateWithDay(dateString) {
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        const days = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
    }

    window.onload = function() {
    setCurrentDateTime();
    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay(); 
        });
    }).catch(function() {
        updateDisplay();
    });
};

    window.updateDisplay = function() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const bgSelect = document.getElementById('backgroundSelect')?.value || '';
        
        if (bgSelect && bgSelect !== currentBgSrc) {
            currentBgSrc = bgSelect;
            getCachedImage(bgSelect);
            return;
        }

        const bgImg = getCachedImage(bgSelect || 'assets/image/bs/backgroundEnter-KT6.1.jpg');
        if (!bgImg || !bgImg.complete) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        const datetime = document.getElementById('datetime')?.value || '-';
        const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
        const batteryLevel = document.getElementById('battery')?.value || '100';
        const money01 = document.getElementById('money01')?.value || '-';
        
        const formattedDateWithDay = formatDateWithDay(datetime.substring(0, 10));
        const formattedTime = datetime.length > 11 ? datetime.substring(11, 16) : '-';
        const formattedTimePlusOne = datetimePlusOne;

        let timeDifference = Math.floor((new Date(`1970-01-01T${formattedTimePlusOne}:00Z`) - new Date(`1970-01-01T${formattedTime}:00Z`)) / 60000);
        let timeMessage = "ตอนนี้";
        if (timeDifference >= 60) timeMessage = `${Math.floor(timeDifference / 60)} ชั่วโมงที่แล้ว`;
        else if (timeDifference > 1) timeMessage = `${timeDifference} นาทีที่แล้ว`;
        else if (timeDifference === 1) timeMessage = "1 นาทีที่แล้ว";
        
        const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';
        const bank1 = document.getElementById('bank1')?.value || '-';
        const receiveraccount = document.getElementById('receiveraccount')?.value || '-';

        drawText(ctx, `${batteryLevel}%`, 521.8, 61.5, 18, 'SarabunRegular', '#414141', 'right', 1.5, 3, 0, 0, 800, 0);

        ctx.font = '18px SarabunRegular';
        const textWidth = ctx.measureText(`${batteryLevel}%`).width;
        const iconX = 531.8 - textWidth - 10 - 110;
        
        const batIcon = getCachedImage('assets/image/icon/icona.png');
        if (batIcon && batIcon.complete && batIcon.naturalHeight !== 0) {
            ctx.drawImage(batIcon, iconX, 34.5, 110, 42);
        }

        drawText(ctx, `   ${formattedDateWithDay}   `, 36.8, 119, 27.5, 'SarabunRegular', '#2c2c2c', 'left', 24, 3, 0, 0, 800, 0);
        drawText(ctx, `${formattedTimePlusOne}`, 62, 60, 20, 'SarabunMedium', '#2c2c2c', 'center', 1.5, 3, 0, 0, 800, 0);
        
        drawText(ctx, `รับเงินสำเร็จ`, 45.8, 435, 23, 'SarabunMedium', '#282828', 'left', 1.5, 3, 0, 0, 800, 0.25);
        drawText(ctx, `${formattedTime}`, 128, 390.3, 18.50, 'SFThonburiRegular', '#585858', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `ได้รับ +${money01} บาท เข้าบัญชี ${senderaccount1} จากบัญชี ${bank1} ${receiveraccount}`, 45.8, 463.9, 20.50, 'SarabunRegular', '#525252', 'left', 30, 3, 0, 0, 430, 0.25);

        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951);
        }

        drawBattery(ctx, batteryLevel, powerSavingMode);
    };

    function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
        ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.shadowColor = shadowColor || 'transparent';
        ctx.shadowBlur = shadowBlur || 0;

        const safeText = String(text || '');
        const paragraphs = safeText.split('<br>');
        let currentY = y;

        paragraphs.forEach(paragraph => {
            const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
            const words = [...segmenter.segment(paragraph)].map(s => s.segment);
            let lines = [], currentLine = '';

            words.forEach(word => {
                const testLine = currentLine + word;
                const testWidth = ctx.measureText(testLine).width + (testLine.length - 1) * letterSpacing;
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
                if (align === 'center') currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
                else if (align === 'right') currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
                
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

        const characters = [...(new Intl.Segmenter('th', { granularity: 'grapheme' })).segment(String(text))].map(s => s.segment);
        let currentX = x;

        characters.forEach((char, index) => {
            const code = char.charCodeAt(0);
            const prevChar = index > 0 ? characters[index - 1].charCodeAt(0) : null;

            let yOff = 0, xOff = 0;
            if (code >= 0x0E34 && code <= 0x0E37) yOff = -1;
            if (code >= 0x0E48 && code <= 0x0E4C) {
                if (prevChar && ((prevChar >= 0x0E34 && prevChar <= 0x0E37) || prevChar === 0x0E31)) yOff = -8;
                else xOff = -7;
            }
            if (code === 0x0E31) { yOff = -1; xOff = 1; }
            if (code >= 0x0E38 && code <= 0x0E3A) { xOff = -10; }

            ctx.fillText(char, currentX + xOff, y + yOff);

            if (![0x0E48,0x0E49,0x0E4A,0x0E4B,0x0E4C,0x0E31,0x0E34,0x0E35,0x0E36,0x0E37,0x0E38,0x0E39,0x0E3A].includes(code)) {
                currentX += ctx.measureText(char).width + letterSpacing;
            } else {
                currentX += ctx.measureText(char).width;
            }
        });
    }

    function drawBattery(ctx, batteryLevel, powerSavingMode) {
        ctx.lineWidth = 2; 
        ctx.strokeStyle = '#9b9b9b'; 
        ctx.fillStyle = '#ffffff'; 

        let batteryColor = '#414141'; 
        if (batteryLevel <= 20) batteryColor = '#ff0000'; 
        else if (powerSavingMode) batteryColor = '#fccd0e'; 

        const x = 525.2, y = 48.1, width = 11.7, height = 13.9, radius = 1; 
        const fillHeight = (batteryLevel / 100) * height; 
        const fillY = y + height - fillHeight; 

        ctx.fillStyle = batteryColor;
        ctx.beginPath();
        ctx.moveTo(x + radius, fillY); 
        ctx.lineTo(x + width - radius, fillY); 
        ctx.arcTo(x + width, fillY, x + width, fillY + radius, radius); 
        ctx.lineTo(x + width, y + height - radius); 
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height); 
        ctx.arcTo(x, y + height, x, y + height - radius, radius); 
        ctx.lineTo(x, fillY + radius); 
        ctx.arcTo(x, fillY, x + radius, fillY, radius); 
        ctx.closePath();
        ctx.fill();
    }

    window.togglePowerSavingMode = function() {
        powerSavingMode = !powerSavingMode;
        document.getElementById('powerSavingMode')?.classList.toggle('active', powerSavingMode);
        window.updateDisplay();
    };

    window.updateBatteryUI = function() {
        const val = document.getElementById('battery')?.value || '100';
        const bl = document.getElementById('battery-level');
        if (bl) bl.innerText = val;
    };

    window.downloadImage = function() {
        const canvas = document.getElementById('canvas');
        if(!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'notify_ktb5.png';
        link.click();
    };

    document.getElementById('generate')?.addEventListener('click', window.updateDisplay);

})();
