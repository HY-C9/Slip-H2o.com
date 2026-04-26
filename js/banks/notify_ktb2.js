(function() {
    let qrCodeImage = null;
    let powerSavingMode = false;

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

    getCachedImage('assets/image/bs/backgroundEnter-KT3.6.jpg');

    function loadFonts() {
        const fonts = [
            new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
            new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
            new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
            new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)')
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
        
        const oneMinuteLater = new Date(now.getTime());
        const hours = oneMinuteLater.getHours().toString().padStart(2, '0');
        const minutes = oneMinuteLater.getMinutes().toString().padStart(2, '0');
        const dtPlus = document.getElementById('datetime_plus_one');
        if (dtPlus) dtPlus.value = `${hours}:${minutes}`;
    }

    function padZero(number) {
        return number < 10 ? '0' + number : number;
    }

    function formatDateWithDay(dateString) {
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
        const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        return `${days[d.getDay()]}ที่ ${d.getDate()} ${months[d.getMonth()]}`;
    }

    function formatDate(dateString) {
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        const day = padZero(d.getDate());
        const month = padZero(d.getMonth() + 1);
        const year = (d.getFullYear() + 543).toString().slice(-2);
        return `${day}/${month}/${year}`;
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

    window.updateDisplay = function() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const bgImg = getCachedImage('assets/image/bs/backgroundEnter-KT3.6.jpg');
        if (!bgImg || !bgImg.complete) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        const datetime = document.getElementById('datetime')?.value || '-';
        const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
        const batteryLevel = document.getElementById('battery')?.value || '100';
        
        const formattedDate = formatDate(datetime.substring(0, 10)); 
        const formattedTime = datetime.length > 11 ? datetime.substring(11, 16) : '-'; 
        const formattedTimePlusOne = datetimePlusOne;

        let timeDifference = Math.floor((new Date(`1970-01-01T${formattedTimePlusOne}:00Z`) - new Date(`1970-01-01T${formattedTime}:00Z`)) / 60000);
        let timeMessage = "ตอนนี้";
        if (timeDifference > 1) timeMessage = `${timeDifference} นาทีที่แล้ว`;
        else if (timeDifference === 1) timeMessage = "1 นาทีที่แล้ว";

        const money01 = document.getElementById('money01')?.value || '-';
        const money02 = document.getElementById('money02')?.value || '-';
        const senderaccount = document.getElementById('senderaccount')?.value || '-';
        const bank1 = document.getElementById('bank1')?.value || '';
        const receiveraccount = document.getElementById('receiveraccount')?.value || '';

        drawText(ctx, `เงินเข้า`, 131.5, 85, 30, 'SFThonburiRegular', '#596163', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `ประเภท`, 131.5, 145, 30, 'SFThonburiRegular', '#596163', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `เข้าบัญชี`, 131.5, 207, 30, 'SFThonburiRegular', '#596163', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `จากบัญชี`, 131.5, 271.5, 30, 'SFThonburiRegular', '#596163', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `ยอดที่ใช้ได้`, 131.5, 335.4, 30, 'SFThonburiRegular', '#596163', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `วันที่ทำรายการ`, 131.5, 399, 30, 'SFThonburiRegular', '#596163', 'left', 1.5, 3, 0, 0, 1250, 0);

        drawText(ctx, `บาท`, 669, 85, 30, 'SFThonburiRegular', '#596163', 'right', 40, 3, 0, 0, 1250, 0);
        const bathWidth = ctx.measureText(`-`).width;
        drawText(ctx, `${money01}`, 669 - bathWidth - 55, 85, 36, 'SFThonburiSemiBold', '#4d90c4', 'right', 40, 3, 0, 0, 1250, -1.5);
        drawText(ctx, `เงินโอนเข้า`, 669, 145, 30, 'SFThonburiRegular', '#596163', 'right', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `${senderaccount}`, 669, 207, 27, 'SFThonburiSemiBold', '#000000', 'right', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `${bank1} ${receiveraccount}`.trim(), 669, 271.5, 27, 'SFThonburiSemiBold', '#000000', 'right', 1.5, 3, 0, 0, 1250, -0.25);
        
        drawText(ctx, `บาท`, 669, 335.4, 30, 'SFThonburiRegular', '#596163', 'right', 40, 3, 0, 0, 1250, 0);
        drawText(ctx, `${money02}`, 669 - bathWidth - 55, 335.4, 30, 'SFThonburiRegular', '#596163', 'right', 40, 3, 0, 0, 1250, -1.5);
        drawText(ctx, `${formattedDate} ${formattedTime}`, 669, 399, 30, 'SFThonburiRegular', '#596163', 'right', 40, 3, 0, 0, 1250, -0.25);

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
        // แบตเตอรี่ KTB จะอยู่ประมาณบนขวา 
        ctx.lineWidth = 2; 
        ctx.strokeStyle = '#f9fafc'; 
        ctx.fillStyle = '#f9fafc'; 

        let batteryColor = '#f9fafc'; 
        if (batteryLevel <= 20) batteryColor = '#ff0000'; 
        else if (powerSavingMode) batteryColor = '#fccd0e'; 

        const fillWidth = (batteryLevel / 100) * 35.5; 
        const x = 478.0, y = 27.5, height = 18.7, radius = 6; 

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

        ctx.font = '800 17px SFThonburiBold';
        ctx.fillStyle = '#f9fafc';
        ctx.textAlign = 'center';
        ctx.fillText(`${batteryLevel}`, x + 35.5 / 2, y + height / 1.25);
    }

    window.togglePowerSavingMode = function() {
        powerSavingMode = !powerSavingMode;
        document.getElementById('powerSavingMode')?.classList.toggle('active', powerSavingMode);
        if (typeof window.updateDisplay === 'function') window.updateDisplay();
    };

    window.updateBatteryUI = function() {
        const val = document.getElementById('battery')?.value || '100';
        const el = document.getElementById('battery-level');
        if (el) el.innerText = val;
    };

    window.downloadImage = function() {
        const canvas = document.getElementById('canvas');
        if(!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'notify_ktb2.png';
        link.click();
    };

    document.getElementById('generate')?.addEventListener('click', window.updateDisplay);

})();