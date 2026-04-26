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
        
        const dt1 = document.getElementById('datetime1');
        if (dt1) dt1.value = localDateTime.substring(0, 16);

        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        
        const dtPlusOne = document.getElementById('datetime_plus_one');
        if (dtPlusOne) dtPlusOne.value = `${hours}:${minutes}`;
    }

    function formatDateWithDay(dateString) {
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
        const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        return `${days[d.getDay()]}ที่ ${d.getDate()} ${months[d.getMonth()]}`;
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

        const bgSelect = document.getElementById('backgroundSelect')?.value || '';
        
        if (bgSelect && bgSelect !== currentBgSrc) {
            currentBgSrc = bgSelect;
            getCachedImage(bgSelect);
            return;
        }

        const bgImg = getCachedImage(bgSelect);
        if (!bgImg || !bgImg.complete) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        const datetime = document.getElementById('datetime')?.value || '-';
        const datetime1 = document.getElementById('datetime1')?.value || '-';
        const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
        const batteryLevel = document.getElementById('battery')?.value || '100';
        const money01 = document.getElementById('money01')?.value || '-';
        const money02 = document.getElementById('money02')?.value || '-';
        const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';
        const bank1 = document.getElementById('bank1')?.value || '-';
        const receiveraccount = document.getElementById('receiveraccount')?.value || '-';
        const bank2 = document.getElementById('bank2')?.value || '-';
        const receiveraccount1 = document.getElementById('receiveraccount1')?.value || '-';

        const formattedDateWithDay = formatDateWithDay(datetime.substring(0, 10));
        const formattedTime = datetime.length > 11 ? datetime.substring(11, 16) : '-';
        const formattedTime1 = datetime1.length > 11 ? datetime1.substring(11, 16) : '-';
        const formattedTimePlusOne = datetimePlusOne;

        let timeDifference = Math.floor((new Date(`1970-01-01T${formattedTimePlusOne}:00Z`) - new Date(`1970-01-01T${formattedTime}:00Z`)) / 60000);
        let timeMessage = "ตอนนี้";
        if (timeDifference >= 60) timeMessage = `${Math.floor(timeDifference / 60)} ชั่วโมงที่แล้ว`;
        else if (timeDifference > 1) timeMessage = `${timeDifference} นาทีที่แล้ว`;
        else if (timeDifference === 1) timeMessage = "1 นาทีที่แล้ว";

        let timeDifference2 = Math.floor((new Date(`1970-01-01T${formattedTimePlusOne}:00Z`) - new Date(`1970-01-01T${formattedTime1}:00Z`)) / 60000);
        let timeMessage2 = "ตอนนี้";
        if (timeDifference2 >= 60) timeMessage2 = `${Math.floor(timeDifference2 / 60)} ชั่วโมงที่แล้ว`;
        else if (timeDifference2 > 1) timeMessage2 = `${timeDifference2} นาทีที่แล้ว`;
        else if (timeDifference2 === 1) timeMessage2 = "1 นาทีที่แล้ว";

        drawText(ctx, `   ${formattedDateWithDay}   `, 308, 167.8, 33.50, 'SFThonburiSemiBold', '#ffffff', 'center', 24, 3, 0, 0, 800, 0);
        drawText(ctx, `${formattedTimePlusOne}`, 295, 298.8, 138.50, 'SFThonburiSemiBold', '#ffffff', 'center', 1.5, 3, 0, 0, 800, -7);

        drawText(ctx, `โอนเงินสำเร็จ`, 107.8, 781, 21.50, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${timeMessage}`, 547.5, 781, 18.50, 'SFThonburiRegular', '#6f8590', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `ได้รับ +${money01} บาท จากบัญชี ${senderaccount1} ไปยังบัญชี ${bank1} ${receiveraccount}`, 107.8, 812, 20.50, 'SFThonburiRegular', '#000000', 'left', 31.5, 3, 0, 0, 430, -0.25);

        drawText(ctx, `โอนเงินสำเร็จ`, 107.8, 919.2, 21.50, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${timeMessage2}`, 547.5, 919.2, 18.50, 'SFThonburiRegular', '#6f8590', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `ได้รับ +${money02} บาท จากบัญชี ${senderaccount1} ไปยังบัญชี ${bank2} ${receiveraccount1}`, 107.8, 950, 20.50, 'SFThonburiRegular', '#000000', 'left', 31.5, 3, 0, 0, 430, -0.25);

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
        ctx.lineWidth = 2; 
        ctx.strokeStyle = '#9b9b9b'; 
        ctx.fillStyle = '#ffffff'; 

        let batteryColor = '#ffffff'; 
        if (batteryLevel <= 20) batteryColor = '#ff0000'; 
        else if (powerSavingMode) batteryColor = '#fccd0e'; 

        const fillWidth = (batteryLevel / 100) * 31; 
        const x = 511.5, y = 32.4, height = 13.8, radius = 4; 

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
    }

    window.togglePowerSavingMode = function() {
        powerSavingMode = !powerSavingMode;
        document.getElementById('powerSavingMode')?.classList.toggle('active', powerSavingMode);
        window.updateDisplay();
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
        link.download = 'notify_ktb4.png';
        link.click();
    };

    document.getElementById('generate')?.addEventListener('click', window.updateDisplay);

})();