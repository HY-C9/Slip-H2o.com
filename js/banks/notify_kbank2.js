(function() {
    const fontPath = 'assets/fonts';
    let powerSavingMode = false;

    async function loadFonts() {
        const fonts = [
            new FontFace('SFThonburiLight', `url(${fontPath}/SFThonburi.woff)`),
            new FontFace('SFThonburiRegular', `url(${fontPath}/SFThonburi-Regular.woff)`),
            new FontFace('SFThonburiSemiBold', `url(${fontPath}/SFThonburi-Semibold.woff)`),
            new FontFace('SFThonburiBold', `url(${fontPath}/SFThonburi-Bold.woff)`)
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

    function setCurrentDateTime() {
        const now = new Date();
        const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
        
        const formattedDateTime = localDateTime.substring(0, 16); 
        const datetimeInput = document.getElementById('datetime');
        if (datetimeInput) datetimeInput.value = formattedDateTime;
        
        const oneMinuteLater = new Date(now.getTime() + 60000); 
        const hours = oneMinuteLater.getHours().toString().padStart(2, '0');
        const minutes = oneMinuteLater.getMinutes().toString().padStart(2, '0');
        const datetimePlusInput = document.getElementById('datetime_plus_one');
        if (datetimePlusInput) datetimePlusInput.value = `${hours}:${minutes}`;
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
        const options = { day: 'numeric', month: 'short', year: '2-digit' };
        let formattedDate = d.toLocaleDateString('th-TH', options).replace(/ /g, ' ').replace(/\./g, '');
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        return `${parseInt(formattedDate.split(' ')[0])} ${months[d.getMonth()]} ${formattedDate.split(' ')[2]}`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        setCurrentDateTime();
        loadFonts().then(() => {
            if (typeof window.updateDisplay === 'function') window.updateDisplay();
        }).catch(() => {
            if (typeof window.updateDisplay === 'function') window.updateDisplay();
        });
    });

    window.updateDisplay = function() {
        try {
            const activeBgMode = document.getElementById('activeBgMode')?.value || 'system';
            let bgToUse = '';
            
            if (activeBgMode === 'custom') {
                bgToUse = document.getElementById('customImageDataUrl')?.value || '';
            } else {
                bgToUse = document.getElementById('backgroundSelect')?.value || '';
            }

            const datetime = document.getElementById('datetime')?.value || '-';
            const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
            const batteryLevel = document.getElementById('battery')?.value || '100';
            const money01 = document.getElementById('money01')?.value || '-';
            const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';
            
            const formattedDate = formatDate(datetime.substring(0, 10)); 
            const formattedDateWithDay = formatDateWithDay(datetime.substring(0, 10)); 
            const formattedTime = datetime.length > 11 ? datetime.substring(11, 16) : '-'; 
            
            let timeDifference = Math.floor((new Date(`1970-01-01T${datetimePlusOne}:00`) - new Date(`1970-01-01T${formattedTime}:00`)) / 60000);
            let timeMessage = "ตอนนี้";

            if (!isNaN(timeDifference)) {
                if (timeDifference >= 60) {
                    timeMessage = `${Math.floor(timeDifference / 60)} ชั่วโมงที่แล้ว`;
                } else if (timeDifference > 1) {
                    timeMessage = `${timeDifference} นาทีที่แล้ว`;
                } else if (timeDifference === 1) {
                    timeMessage = "1 นาทีที่แล้ว";
                }
            }
            
            const canvas = document.getElementById('canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            const drawUI = function() {
                try {
                    drawText(ctx, `   ${formattedDateWithDay}   `, 308, 167.8, 33.50, 'SFThonburiSemiBold', '#ffffff', 'center', 24, 3, 0, 0, 800, 0);
                    drawText(ctx, `${datetimePlusOne}`, 295, 298.8, 138.50, 'SFThonburiSemiBold', '#ffffff', 'center', 1.5, 3, 0, 0, 800, -7);
                    drawText(ctx, `รายการเงินเข้า`, 107.8, 451.8, 21.50, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
                    drawText(ctx, `${timeMessage}`, 547.5, 451.8, 18.50, 'SFThonburiRegular', '#6f8590', 'right', 1.5, 3, 0, 0, 800, 0);
                    drawText(ctx, `บัญชี ${senderaccount1} จำนวนเงิน ${money01} บาท วันที่ ${formattedDate} ${formattedTime} น.<br>`, 107.8, 481.8, 20.50, 'SFThonburiRegular', '#000000', 'left', 31.5, 3, 0, 0, 420, 0);
                    drawBattery(ctx, batteryLevel, powerSavingMode);
                } catch(e) {}
            };

            const drawOverlaysAndUI = function() {
                let loadedCount = 0;
                const img1 = new Image();
                const img2 = new Image();
                let img1Success = false, img2Success = false;

                const checkAndDraw = () => {
                    loadedCount++;
                    if (loadedCount === 2) {
                        if (img1Success) {
                            ctx.globalAlpha = 0.90;
                            ctx.drawImage(img1, 0, 0, canvas.width, canvas.height);
                            ctx.globalAlpha = 1.0; 
                        }
                        if (img2Success) {
                            ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
                        }
                        drawUI(); 
                    }
                };

                img1.onload = () => { img1Success = true; checkAndDraw(); };
                img1.onerror = () => { checkAndDraw(); };
                img1.src = 'assets/image/bs/backgroundEnter-KB2.666.png';

                img2.onload = () => { img2Success = true; checkAndDraw(); };
                img2.onerror = () => { checkAndDraw(); };
                img2.src = 'assets/image/bs/backgroundEnter-KB2.667.png';
            };

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (activeBgMode === 'custom' && bgToUse) {
                const userImg = new Image();
                userImg.onload = function() {
                    const imgRatio = userImg.width / userImg.height;
                    const canvasRatio = canvas.width / canvas.height;
                    let renderW, renderH, offsetX = 0, offsetY = 0;

                    if (imgRatio < canvasRatio) {
                        renderW = canvas.width;
                        renderH = canvas.width / imgRatio;
                        offsetY = (canvas.height - renderH) / 2;
                    } else {
                        renderH = canvas.height;
                        renderW = canvas.height * imgRatio;
                        offsetX = (canvas.width - renderW) / 2;
                    }
                    ctx.drawImage(userImg, offsetX, offsetY, renderW, renderH);
                    drawOverlaysAndUI();
                };
                userImg.onerror = function() {
                    ctx.fillStyle = "#1e293b"; 
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawOverlaysAndUI();
                };
                userImg.src = bgToUse;
            } else if (activeBgMode === 'system' && bgToUse) {
                const systemImg = new Image();
                systemImg.onload = function() {
                    ctx.drawImage(systemImg, 0, 0, canvas.width, canvas.height);
                    drawUI();
                };
                systemImg.onerror = function() {
                    ctx.fillStyle = "#1e293b"; 
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawUI(); 
                };
                systemImg.src = bgToUse;
            } else {
                ctx.fillStyle = "#1e293b"; 
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawOverlaysAndUI();
            }
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

        let batteryColor = '#ffffff'; 
        if (batteryLevel <= 20) {
            batteryColor = '#ff0000';
        } else if (powerSavingMode) {
            batteryColor = '#fccd0e'; 
        }

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
        const powerSavingButton = document.getElementById('powerSavingMode');
        if(powerSavingButton) {
            if (powerSavingMode) {
                powerSavingButton.classList.remove('btn-outline-warning');
                powerSavingButton.classList.add('btn-warning');
            } else {
                powerSavingButton.classList.remove('btn-warning');
                powerSavingButton.classList.add('btn-outline-warning');
            }
        }
        if (typeof window.updateDisplay === 'function') window.updateDisplay();
    };

    window.downloadImage = function() {
        const canvas = document.getElementById('canvas');
        if(!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'notify_kbank1.png';
        link.click();
    };

    const generateBtn = document.getElementById('generate');
    if (generateBtn) generateBtn.addEventListener('click', window.updateDisplay);
})();