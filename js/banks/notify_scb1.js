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

    getCachedImage('assets/image/bs/backgroundEnter-SCB1.jpg');
    getCachedImage('assets/image/icon/icona.png');

    function loadFonts() {
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
            new FontFace('DBHelvethaicaMonX', 'url(assets/fonts/DBHelvethaicaMonX.woff)'),
            new FontFace('DBHelvethaicaMonXMed', 'url(assets/fonts/DBHelvethaicaMonXMed.woff)')
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
        const formattedDate = localDateTime.substring(0, 10);
        
        const dt = document.getElementById('datetime');
        if (dt) dt.value = formattedDate;

        const oneMinuteLater = new Date(now.getTime() + 60000);
        const hours = oneMinuteLater.getHours().toString().padStart(2, '0');
        const minutes = oneMinuteLater.getMinutes().toString().padStart(2, '0');
        const dtPlusOne = document.getElementById('datetime_plus_one');
        if (dtPlusOne) dtPlusOne.value = `${hours}:${minutes}`;
    }

    function padZero(number) {
        return number < 10 ? '0' + number : number;
    }

    function formatDate(dateString) {
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const day = padZero(d.getDate());
        const month = months[d.getMonth()];
        return `${day} ${month}`;
    }

    window.handlePaste = function(event) {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = e => {
                    const img = new Image();
                    img.onload = () => { qrCodeImage = img; window.updateDisplay(); };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(blob);
            }
        }
    };
    document.addEventListener('paste', window.handlePaste);

    function formatMoney(type, val) {
        let str = String(val || '');
        if (type === 'ถอนเงิน - EASY') {
            if (str.startsWith('+')) return '-' + str.substring(1);
            if (!str.startsWith('-')) return '-' + str;
        } else if (type === 'ฝากเงิน - EASY') {
            if (str.startsWith('-')) return '+' + str.substring(1);
            if (!str.startsWith('+')) return '+' + str;
        }
        return str;
    }

    window.updateDisplay = function() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const bgImg = getCachedImage('assets/image/bs/backgroundEnter-SCB1.jpg');
        if (!bgImg || !bgImg.complete) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        const datetime = document.getElementById('datetime')?.value || '-';
        const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
        const batteryLevel = document.getElementById('battery')?.value || '100';

        const formattedDate = formatDate(datetime.substring(0, 10)); 
        const formattedTimePlusOne = datetimePlusOne;

        const sendername = document.getElementById('sendername')?.value || '-';
        const senderaccount = document.getElementById('senderaccount')?.value || '-';
        const money01 = document.getElementById('money01')?.value || '-';

        const choose1 = document.getElementById('choose1')?.value || '-';
        const m1Raw = document.getElementById('money1')?.value || '';
        const money1 = formatMoney(choose1, m1Raw);
        if(document.getElementById('money1') && document.activeElement !== document.getElementById('money1')) document.getElementById('money1').value = money1;
        const time1 = document.getElementById('time1')?.value || '-';
        
        const choose2 = document.getElementById('choose2')?.value || '-';
        const m2Raw = document.getElementById('money2')?.value || '';
        const money2 = formatMoney(choose2, m2Raw);
        if(document.getElementById('money2') && document.activeElement !== document.getElementById('money2')) document.getElementById('money2').value = money2;
        const time2 = document.getElementById('time2')?.value || '-';
        
        const choose3 = document.getElementById('choose3')?.value || '-';
        const m3Raw = document.getElementById('money3')?.value || '';
        const money3 = formatMoney(choose3, m3Raw);
        if(document.getElementById('money3') && document.activeElement !== document.getElementById('money3')) document.getElementById('money3').value = money3;
        const time3 = document.getElementById('time3')?.value || '-';

        let textColor1 = (choose1 === 'ถอนเงิน - EASY') ? '#da0000' : '#63bb07';
        let textColor2 = (choose2 === 'ถอนเงิน - EASY') ? '#da0000' : '#63bb07';
        let textColor3 = (choose3 === 'ถอนเงิน - EASY') ? '#da0000' : '#63bb07';

        drawText(ctx, `${formattedTimePlusOne}`, 155, 60, 28, 'SFThonburiSemiBold', '#ffffff', 'right', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${sendername}`, 193.9, 262, 32, 'DBHelvethaicaMonX', '#959199', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${senderaccount}`, 193.9, 301.6, 32, 'DBHelvethaicaMonX', '#959199', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money01}`, 556, 345, 52, 'DBHelvethaicaMonXMed', '#000000', 'right', 1.5, 3, 0, 0, 800, -1.2);

        drawText(ctx, `${choose1}`, 80.5, 764, 37, 'DBHelvethaicaMonX', '#45424a', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money1}`, 636, 764, 37, 'DBHelvethaicaMonXMed', textColor1, 'right', 1.5, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${formattedDate} - ${time1}`, 636, 803, 26.5, 'DBHelvethaicaMonX', '#959199', 'right', 1.5, 3, 0, 0, 400, 0);

        drawText(ctx, `${choose2}`, 80.5, 916.8, 37, 'DBHelvethaicaMonX', '#45424a', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money2}`, 636, 916.8, 37, 'DBHelvethaicaMonXMed', textColor2, 'right', 1.5, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${formattedDate} - ${time2}`, 636, 955.9, 26.5, 'DBHelvethaicaMonX', '#959199', 'right', 1.5, 3, 0, 0, 400, 0);

        drawText(ctx, `${choose3}`, 80.5, 1069.6, 37, 'DBHelvethaicaMonX', '#45424a', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money3}`, 636, 1069.6, 37, 'DBHelvethaicaMonXMed', textColor3, 'right', 1.5, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${formattedDate} - ${time3}`, 636, 1108.7, 26.5, 'DBHelvethaicaMonX', '#959199', 'right', 1.5, 3, 0, 0, 400, 0);

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

        let batteryColor = '#ffffff'; 
        if (batteryLevel <= 20) batteryColor = '#ff0000'; 
        else if (powerSavingMode) batteryColor = '#fccd0e'; 

        const fillWidth = (batteryLevel / 100) * 46; 
        const x = 600, y = 35.5, height = 25.0, radius = 8; 

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

        drawText(ctx, `${batteryLevel}`, x + 46 / 2, y + height / 1.26, 21, 'SFThonburiBold', '#7941c0', 'center', 1, 1, 0, 0, 100, -1);
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
        link.download = 'notify_scb1.png';
        link.click();
    };

    document.getElementById('generate')?.addEventListener('click', window.updateDisplay);

})();