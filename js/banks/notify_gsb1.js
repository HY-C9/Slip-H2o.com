function loadFonts() {
    const fonts = [
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)')
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
    const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
    const formattedDateTime = localDateTime.replace(' ', 'T');
    const dt = document.getElementById('datetime');
    if(dt) dt.value = formattedDateTime;
}

function formatDate(date) {
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
    formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const day = padZero(formattedDate.split(' ')[0]);
    const month = months[new Date(date).getMonth()];
    let year = formattedDate.split(' ')[2];
    year = `25${year}`;
    return `${day} ${month} ${year}`;
}

function generateUniqueID() {
    const fixedPart = "002"; 
    const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${randomPart}${fixedPart}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

let qrCodeImage = null;

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
    const sendername = document.getElementById('sendername')?.value || '-';
    const senderaccount = document.getElementById('senderaccount')?.value || '-';
    const receivername = document.getElementById('receivername')?.value || '-';
    const receiveraccount = document.getElementById('receiveraccount')?.value || '-';
    const bank = document.getElementById('bank')?.value || '-';
    const amount11 = document.getElementById('amount11')?.value || '-';
    const datetime = document.getElementById('datetime')?.value || '-';

    let bankLogoUrl = '';
    switch (bank) {
        case 'ธนาคารกสิกรไทย': bankLogoUrl = 'assets/image/logo/KBANK.png'; break;
        case 'ธนาคารกรุงไทย': bankLogoUrl = 'assets/image/logo/KTB.png'; break;
        case 'ธนาคารกรุงเทพ': bankLogoUrl = 'assets/image/logo/BBL.png'; break;
        case 'ธนาคารไทยพาณิชย์': bankLogoUrl = 'assets/image/logo/SCB.png'; break;
        case 'ธนาคารกรุงศรีอยุธยา': bankLogoUrl = 'assets/image/logo/BAY.png'; break;
        case 'ธนาคารทหารไทยธนชาต': bankLogoUrl = 'assets/image/logo/TTB1.png'; break;
        case 'ธนาคารออมสิน': bankLogoUrl = 'assets/image/logo/O3.png'; break;
        case 'ธ.ก.ส.': bankLogoUrl = 'assets/image/logo/T.png'; break;
        case 'ธนาคารอาคารสงเคราะห์': bankLogoUrl = 'assets/image/logo/C.png'; break;
        case 'ธนาคารเกียรตินาคินภัทร': bankLogoUrl = 'assets/image/logo/K.png'; break;
        case 'ธนาคารซีไอเอ็มบีไทย': bankLogoUrl = 'assets/image/logo/CIMB.png'; break;
        case 'ธนาคารยูโอบี': bankLogoUrl = 'assets/image/logo/UOB3.png'; break;
        case 'ธนาคารแลนด์ แอนด์ เฮาส์': bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
        case 'ธนาคารไอซีบีซี': bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
        default: bankLogoUrl = '';
    }
    
    let formattedDate = '-';
    let formattedTime = '-';
    if(datetime !== '-' && !isNaN(new Date(datetime))) {
        formattedDate = formatDate(datetime);
        formattedTime = new Date(datetime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    }

    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const drawAllContent = (bgImg, logoImg, receiverLogoImg) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if(bgImg) {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        if (logoImg) {
            ctx.drawImage(logoImg, 94, 590, 98, 98); 
        }

        drawText(ctx, `${amount11}`, 411, 317, 72, 'SFThonburiBold', '#000000', 'center', 1.5, 3, 0, 0, 500, -3);
        drawText(ctx, `0.00 ค่าธรรมเนียม`, 411, 372.2, 29, 'SFThonburiBold', '#979797', 'center', 1.5, 3, 0, 0, 500, 0);
        drawText(ctx, `รหัสอ้างอิง: ${generateUniqueID()}`, 411, 415.8, 28, 'SFThonburiRegular', '#979797', 'center', 1.5, 3, 0, 0, 700, -0.7);
        drawText(ctx, `${formattedDate}    ${formattedTime}`, 411, 466.5, 30, 'SFThonburiBold', '#000000', 'center', 1.5, 3, 0, 0, 700, 0);

        drawText(ctx, `${receivername}`, 213.1, 647.3, 48, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 700, -0.50);
        drawText(ctx, `${bank}`, 213.1, 706.2, 36, 'SFThonburiRegular', '#525252', 'left', 1.5, 2, 0, 0, 500, 0);
        drawText(ctx, `${receiveraccount}`, 213.1, 753.5, 36, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
        
        drawText(ctx, `${sendername}`, 213.1, 933.5, 48, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 700, -0.50);
        drawText(ctx, `ธนาคารออมสิน`, 213.1, 992, 36, 'SFThonburiRegular', '#525252', 'left', 1.5, 2, 0, 0, 500, 0);
        drawText(ctx, `${senderaccount}`, 213.1, 1040, 36, 'SFThonburiRegular', '#525252', 'left', 1.5, 1, 0, 0, 500, -1);
        
        if (receiverLogoImg) {
            ctx.drawImage(receiverLogoImg, 94, 876, 98, 98);  
        }

        if (qrCodeImage) {
             ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951); 
        }
    };

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/image/bs/backgroundEnter-O1.jpg';
    
    backgroundImage.onload = function() {
        const bankLogo = new Image();
        bankLogo.src = bankLogoUrl;
        
        bankLogo.onload = function() {
            const receiverLogo = new Image();
            receiverLogo.src = 'assets/image/logo/O3.png';
            receiverLogo.onload = function() {
                drawAllContent(backgroundImage, bankLogo, receiverLogo);
            };
            receiverLogo.onerror = function() {
                drawAllContent(backgroundImage, bankLogo, null);
            };
        };
        bankLogo.onerror = function() {
            const receiverLogo = new Image();
            receiverLogo.src = 'assets/image/logo/O3.png';
            receiverLogo.onload = function() {
                drawAllContent(backgroundImage, null, receiverLogo);
            };
            receiverLogo.onerror = function() {
                drawAllContent(backgroundImage, null, null);
            };
        };
    };

    backgroundImage.onerror = function() {
        drawAllContent(null, null, null);
    };
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
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
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
        if (currentLine) {
            lines.push(currentLine);
        }

        lines.forEach((line, index) => {
            let currentX = x;

            if (align === 'center') {
                currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }

            drawTextLine(ctx, line, currentX, currentY, letterSpacing);
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) {
                return;
            }
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
    const characters = [...segmenter.segment(text)].map(segment => segment.segment);
    let currentPosition = x;

    characters.forEach((char) => {
        ctx.fillText(char, currentPosition, y);
        const charWidth = ctx.measureText(char).width;
        currentPosition += charWidth + letterSpacing;
    });
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'slip_gsb1.png';
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