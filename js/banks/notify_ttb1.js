function loadFonts() {
    const fonts = [
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)'),
        new FontFace('DXTTBBold', 'url(assets/fonts/DX-TTB-bold.woff)'),
        new FontFace('DXTTBRegular', 'url(assets/fonts/DX-TTB-regular.woff)')
    ];

    return Promise.allSettled(fonts.map(font => font.load())).then(function(loadedFonts) {
        loadedFonts.forEach(function(result) {
            if (result.status === 'fulfilled') {
                document.fonts.add(result.value);
            }
        });
    });
}

window.onload = function() {
    setCurrentDateTime();
    updateMonthAndYear(); 

    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay(); 
        });
    }).catch(function() {
        updateDisplay();
    });
};

function setCurrentDateTime() {
    const now = new Date();
    const hours = padZero(now.getHours());
    const minutes = padZero(now.getMinutes());
    const dt = document.getElementById('datetime');
    if(dt) dt.value = `${hours}:${minutes}`;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

function updateMonthAndYear() {
    const today = new Date();
    
    const shortThaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const fullThaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    const day = String(today.getDate()).padStart(2, '0');
    const shortMonth = shortThaiMonths[today.getMonth()]; 
    const fullMonth = fullThaiMonths[today.getMonth()]; 
    const year = today.getFullYear() + 543; 

    const monthAndYear = `${shortMonth} ${year % 100}`; 
    const mAndYInput = document.getElementById('monthandyear');
    if(mAndYInput) mAndYInput.value = monthAndYear;

    const monthMonthYear = `${day} ${fullMonth} ${year % 100}`;
    const mMonthYInput = document.getElementById('monthmonthyear');
    if(mMonthYInput) mMonthYInput.value = monthMonthYear;
}

function formatDate(date) {
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
    formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const day = padZero(formattedDate.split(' ')[0]);
    const month = months[new Date(date).getMonth()];
    const year = formattedDate.split(' ')[2];
    return `${day} ${month} ${year}`;
}

let qrCodeImage = null;
let powerSavingMode = false;

window.handlePaste = function(event) {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    qrCodeImage = img;
                    updateDisplay();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(blob);
        }
    }
}

window.updateDisplay = function() {
    const datetime = document.getElementById('datetime')?.value || '-';
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const monthandyear = document.getElementById('monthandyear')?.value || '-';
    const monthmonthyear = document.getElementById('monthmonthyear')?.value || '-';
    
    const bank1 = document.getElementById('bank1')?.value || '-';
    const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';
    const name1 = document.getElementById('name1')?.value || '-';
    
    const choose1 = document.getElementById('choose1')?.value || '-';
    let money1 = document.getElementById('money1')?.value || '-';
    const time1 = document.getElementById('time1')?.value || '-';
    
    const choose2 = document.getElementById('choose2')?.value || '-';
    let money2 = document.getElementById('money2')?.value || '-';
    const time2 = document.getElementById('time2')?.value || '-';
    
    const choose3 = document.getElementById('choose3')?.value || '-';
    let money3 = document.getElementById('money3')?.value || '-';
    const time3 = document.getElementById('time3')?.value || '-';
    
    const choose4 = document.getElementById('choose4')?.value || '-';
    let money4 = document.getElementById('money4')?.value || '-';
    const time4 = document.getElementById('time4')?.value || '-';
    
    const choose5 = document.getElementById('choose5')?.value || '-';
    let money5 = document.getElementById('money5')?.value || '-';
    
    if (choose1 === 'โอนเงินออก' && !money1.startsWith('-')) {
        money1 = money1.startsWith('+') ? '-' + money1.substring(1) : '-' + money1;
    } else if (choose1 === 'รับเงินโอน' && !money1.startsWith('+')) {
        money1 = money1.startsWith('-') ? '+' + money1.substring(1) : '+' + money1;
    }
    const m1Input = document.getElementById('money1');
    if(m1Input) m1Input.value = money1;
    
    if (choose2 === 'โอนเงินออก' && !money2.startsWith('-')) {
        money2 = money2.startsWith('+') ? '-' + money2.substring(1) : '-' + money2;
    } else if (choose2 === 'รับเงินโอน' && !money2.startsWith('+')) {
        money2 = money2.startsWith('-') ? '+' + money2.substring(1) : '+' + money2;
    }
    const m2Input = document.getElementById('money2');
    if(m2Input) m2Input.value = money2;
    
    if (choose3 === 'โอนเงินออก' && !money3.startsWith('-')) {
        money3 = money3.startsWith('+') ? '-' + money3.substring(1) : '-' + money3;
    } else if (choose3 === 'รับเงินโอน' && !money3.startsWith('+')) {
        money3 = money3.startsWith('-') ? '+' + money3.substring(1) : '+' + money3;
    }
    const m3Input = document.getElementById('money3');
    if(m3Input) m3Input.value = money3;
    
    if (choose4 === 'โอนเงินออก' && !money4.startsWith('-')) {
        money4 = money4.startsWith('+') ? '-' + money4.substring(1) : '-' + money4;
    } else if (choose4 === 'รับเงินโอน' && !money4.startsWith('+')) {
        money4 = money4.startsWith('-') ? '+' + money4.substring(1) : '+' + money4;
    }
    const m4Input = document.getElementById('money4');
    if(m4Input) m4Input.value = money4;
    
    if (choose5 === 'โอนเงินออก' && !money5.startsWith('-')) {
        money5 = money5.startsWith('+') ? '-' + money5.substring(1) : '-' + money5;
    } else if (choose5 === 'รับเงินโอน' && !money5.startsWith('+')) {
        money5 = money5.startsWith('-') ? '+' + money5.substring(1) : '+' + money5;
    }
    const m5Input = document.getElementById('money5');
    if(m5Input) m5Input.value = money5;

    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawAllContent = (bgImg) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (bgImg) {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff6b6b';
            ctx.font = '20px Kanit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('❌ หาภาพพื้นหลังไม่เจอ', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = '#1e3a8a';
            ctx.font = '16px Kanit, sans-serif';
            ctx.fillText('ตรวจสอบไฟล์: assets/image/bs/backgroundEnter-T1.jpg', canvas.width / 2, canvas.height / 2 + 10);
        }

        drawText(ctx, `${datetime}`, 63.4, 45.8, 22.50, 'SFThonburiSemiBold', '#ffffff', 'left', 1.5, 3, 0, 0, 800, 0);
        
        let textColor1 = choose1 === 'โอนเงินออก' ? '#d56b5d' : '#57b65c';
        let textColor2 = choose2 === 'โอนเงินออก' ? '#d56b5d' : '#57b65c';
        let textColor3 = choose3 === 'โอนเงินออก' ? '#d56b5d' : '#57b65c';
        let textColor4 = choose4 === 'โอนเงินออก' ? '#d56b5d' : '#57b65c';
        let textColor5 = choose5 === 'โอนเงินออก' ? '#d56b5d' : '#57b65c';
        
        drawText(ctx, `${monthandyear}`, 36, 311, 22, 'DXTTBRegular', '#0f2c5f', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${monthmonthyear}`, 21.8, 472.1, 18.03, 'DXTTBRegular', '#747f90', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${choose1}`, 43.3, 534.8, 23, 'DXTTBBold', '#0f2c5f', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money1}`, 80.0, 534.8, 22, 'DXTTBBold', textColor1, 'right', 1.5, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${monthmonthyear}, ${time1} น.`, 43.3, 573.4, 18.03, 'DXTTBRegular', '#747f90', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${senderaccount1}`, 40.6, 636.5, 19.65, 'DXTTBBold', '#0f2c5f', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${name1}`, 40.6,  668.7, 19.65, 'DXTTBBold', '#0f2c5f', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${bank1}`, 40.6, 705.5, 19.65, 'DXTTBBold', '#0f2c5f', 'right', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${choose2}`, 43.3, 813.4, 23, 'DXTTBBold', '#0f2c5f', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money2}`, 80.0, 813.4, 22, 'DXTTBBold', textColor2, 'right', 1.5, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${monthmonthyear}, ${time2} น.`, 43.3, 851.3, 18.03, 'DXTTBRegular', '#747f90', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${choose3}`, 43.3, 937.2, 23, 'DXTTBBold', '#0f2c5f', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money3}`, 80.0, 937.2, 22, 'DXTTBBold', textColor3, 'right', 1.5, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${monthmonthyear}, ${time3} น.`, 43.3, 975.9, 18.03, 'DXTTBRegular', '#747f90', 'left', 1.5, 3, 0, 0, 800, -0.50);

        drawText(ctx, `${choose4}`, 43.3, 1061.4, 23, 'DXTTBBold', '#0f2c5f', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money4}`, 80.0, 1061.4, 22, 'DXTTBBold', textColor4, 'right', 1.5, 3, 0, 0, 800, -0.50);
        drawText(ctx, `${monthmonthyear}, ${time4} น.`, 43.3, 1100.1, 18.03, 'DXTTBRegular', '#747f90', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${choose5}`, 43.3, 1185.3, 23, 'DXTTBBold', '#0f2c5f', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${money5}`, 80.0, 1185.3, 22, 'DXTTBBold', textColor5, 'right', 1.5, 3, 0, 0, 800, 0);
        
        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951); 
        }

        drawBattery(ctx, batteryLevel, powerSavingMode);
    };

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/image/bs/backgroundEnter-T1.jpg';
    
    backgroundImage.onload = function() {
        drawAllContent(backgroundImage);
    };

    backgroundImage.onerror = function() {
        drawAllContent(null);
    }
}

function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
        const words = paragraph.split(' ');
        let currentLine = '';
        const lines = [];

        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

            if (testWidth > maxWidth && i > 0) {
                lines.push(currentLine);
                currentLine = words[i] + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        lines.forEach((line, index) => {
            let currentX = x;
            if (align === 'center') {
                currentX = (ctx.canvas.width - ctx.measureText(line).width) / 1.72 - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = ctx.canvas.width - x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }

            drawTextLine(ctx, line.trim(), currentX, currentY, letterSpacing);
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) {
                return;
            }
        });
    });
}

function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }

    const characters = text.split('');
    let currentPosition = x;

    characters.forEach((char, index) => {
        const charCode = char.charCodeAt(0);
        const prevChar = index > 0 ? characters[index - 1] : null;
        const prevCharCode = prevChar ? prevChar.charCodeAt(0) : null;

        const isUpperVowel = (charCode >= 0x0E34 && charCode <= 0x0E37);
        const isToneMark = (charCode >= 0x0E48 && charCode <= 0x0E4C);
        const isBeforeVowel = (charCode === 0x0E31);
        const isBelowVowel = (charCode >= 0x0E38 && charCode <= 0x0E3A);

        let yOffset = 0;
        let xOffset = 0;

        if (isUpperVowel) {
            yOffset = -1;
            xOffset = 0;
        }

        if (isToneMark) {
            if (prevChar && ((prevChar.charCodeAt(0) >= 0x0E34 && prevChar.charCodeAt(0) <= 0x0E37) || prevChar.charCodeAt(0) === 0x0E31)) {
                yOffset = -8; 
                xOffset = 0; 
            } else {
                yOffset = 0; 
                xOffset = -7; 
            }
        }

        if (isBeforeVowel) {
            yOffset = -1;
            xOffset = 1;
        }

        if (isBelowVowel) {
            yOffset = 0;
            xOffset = -10;
        }

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

    const fillWidth = (batteryLevel / 100) * 35.5; 
    const x = 478.0;
    const y = 27.5;
    const height = 18.7;
    const radius = 6; 

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
    ctx.fillStyle = '#204fe7';
    ctx.textAlign = 'center';
    ctx.fillText(`${batteryLevel}`, x + 35.5 / 2, y + height / 1.25);
}

window.togglePowerSavingMode = function() {
    powerSavingMode = !powerSavingMode;
    const powerSavingButton = document.getElementById('powerSavingMode');
    if(powerSavingButton) powerSavingButton.classList.toggle('active', powerSavingMode);
    updateDisplay();
}

window.updateBatteryDisplay = function() {
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const bl = document.getElementById('battery-level');
    if(bl) bl.innerText = batteryLevel;
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'slip_ttb1.png';
    link.click();
}

const genBtn = document.getElementById('generate');
if(genBtn) {
    genBtn.addEventListener('click', updateDisplay);
}

function drawImage(ctx, imageUrl, x, y, width, height) {
    const image = new Image();
    image.src = imageUrl;
    image.onload = function() {
        ctx.drawImage(image, x, y, width, height);
    };
}