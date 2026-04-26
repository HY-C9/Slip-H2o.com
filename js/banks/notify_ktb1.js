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

    getCachedImage('assets/image/bs/backgroundEnter-KT11.jpg');

    function loadFonts() {
        const fonts = [
            new FontFace('DXKrungthaiThin', 'url(assets/fonts/DX-Krungthai-Thin.woff)'),
            new FontFace('DXKrungthaiRegular', 'url(assets/fonts/DX-Krungthai-Regular.woff)'),
            new FontFace('DXKrungthaiMedium', 'url(assets/fonts/DX-Krungthai-Medium.woff)'),
            new FontFace('DXKrungthaiSemiBold', 'url(assets/fonts/DX-Krungthai-SemiBold.woff)'),
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
        updateMonthAndYear();
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
        const formattedDate = now.toISOString().split('T')[0];
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

    function updateMonthAndYear() {
        const today = new Date();
        const shortThaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        const shortMonth = shortThaiMonths[today.getMonth()];
        const year = today.getFullYear() + 543;
        const monthAndYear = `${shortMonth} ${year % 100}`;
        const el = document.getElementById('monthandyear');
        if (el) el.value = monthAndYear;
    }

    function formatDate(dateString) {
        const d = new Date(dateString);
        if (isNaN(d)) return '-';
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const day = padZero(d.getDate());
        const month = months[d.getMonth()];
        const year = (d.getFullYear() + 543).toString().slice(-2);
        return `${day} ${month} ${year}`;
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

    function formatMoneySign(chooseType, moneyVal) {
        let val = String(moneyVal || '');
        if (chooseType === 'โอนเงินออก' && !val.startsWith('-')) {
            val = val.startsWith('+') ? '-' + val.substring(1) : '-' + val;
        } else if (chooseType === 'เงินโอนเข้า' && !val.startsWith('+')) {
            val = val.startsWith('-') ? '+' + val.substring(1) : '+' + val;
        }
        return val;
    }

    window.updateDisplay = function() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const bgImg = getCachedImage('assets/image/bs/backgroundEnter-KT11.jpg');
        if (!bgImg || !bgImg.complete) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        const monthandyear = document.getElementById('monthandyear')?.value || '-';
        const datetime = document.getElementById('datetime')?.value || '-';
        const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
        const batteryLevel = document.getElementById('battery')?.value || '100';
        const sendername = document.getElementById('sendername')?.value || '-';
        const senderaccount = document.getElementById('senderaccount')?.value || '-';
        const money01 = document.getElementById('money01')?.value || '-';

        const formattedDate = formatDate(datetime.substring(0, 10));

        const choose1 = document.getElementById('choose1')?.value || '-';
        const money1 = formatMoneySign(choose1, document.getElementById('money1')?.value);
        const time1 = document.getElementById('time1')?.value || '-';
        if (document.getElementById('money1')) document.getElementById('money1').value = money1;

        const choose2 = document.getElementById('choose2')?.value || '-';
        const money2 = formatMoneySign(choose2, document.getElementById('money2')?.value);
        const time2 = document.getElementById('time2')?.value || '-';
        if (document.getElementById('money2')) document.getElementById('money2').value = money2;

        const choose3 = document.getElementById('choose3')?.value || '-';
        const money3 = formatMoneySign(choose3, document.getElementById('money3')?.value);
        const time3 = document.getElementById('time3')?.value || '-';
        if (document.getElementById('money3')) document.getElementById('money3').value = money3;

        const c1 = choose1 === 'โอนเงินออก' ? '#da0000' : '#63bb07';
        const c2 = choose2 === 'โอนเงินออก' ? '#da0000' : '#63bb07';
        const c3 = choose3 === 'โอนเงินออก' ? '#da0000' : '#63bb07';

        drawText(ctx, `${datetimePlusOne}`, 27.4, 23.2, 18.50, 'SFThonburiBold', '#4a4c4b', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${monthandyear}`, 45.4, 648.5, 24.5, 'DXKrungthaiSemiBold', '#0098d2', 'right', 1.5, 3, 0, 0, 400, 0);

        drawText(ctx, `${sendername}`, 41.9, 171.4, 25.49, 'DXKrungthaiSemiBold', '#ffffff', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${senderaccount}`, 41.9, 208.0, 22.49, 'DXKrungthaiThin', '#d1f5fe', 'left', 1.5, 3, 0, 0, 800, 1);
        drawText(ctx, `${money01}`, 41.9, 295.5, 40.49, 'DXKrungthaiSemiBold', '#ffffff', 'left', 1.5, 3, 0, 0, 800, -0.25);
        drawText(ctx, `${money01}`, 36.4, 337.1, 23.24, 'DXKrungthaiRegular', '#ffffff', 'right', 1.5, 3, 0, 0, 800, -0.50);

        drawText(ctx, `${choose1}`, 43.3, 723.0, 25.58, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money1}`, 36.4, 762.2, 25.58, 'DXKrungthaiSemiBold', c1, 'right', 1.5, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${formattedDate} - ${time1}`, 36.4, 720.5, 22.49, 'DXKrungthaiRegular', '#8a9ba7', 'right', 1.5, 3, 0, 0, 400, 0.50);

        drawText(ctx, `${choose2}`, 43.3, 853.8, 25.58, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money2}`, 36.4, 893.5, 25.58, 'DXKrungthaiSemiBold', c2, 'right', 1.5, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${formattedDate} - ${time2}`, 36.4, 851.6, 22.49, 'DXKrungthaiRegular', '#8a9ba7', 'right', 1.5, 3, 0, 0, 400, 0.50);

        drawText(ctx, `${choose3}`, 43.3, 985.4, 25.58, 'DXKrungthaiMedium', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money3}`, 36.4, 1024.8, 25.58, 'DXKrungthaiSemiBold', c3, 'right', 1.5, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${formattedDate} - ${time3}`, 36.4, 982.6, 22.49, 'DXKrungthaiRegular', '#8a9ba7', 'right', 1.5, 3, 0, 0, 400, 0.50);

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

        const paragraphs = String(text || '').split('<br>');
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
                    currentX = (ctx.canvas.width - ctx.measureText(line).width) / 1.72 - ((line.length - 1) * letterSpacing) / 2;
                } else if (align === 'right') {
                    currentX = ctx.canvas.width - x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
                }

                drawTextLine(ctx, line.trim(), currentX, currentY, letterSpacing);
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
        link.download = 'notify_ktb1.png';
        link.click();
    };

    document.getElementById('generate')?.addEventListener('click', window.updateDisplay);
})();