// Get the canvas element

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
ctx.lineWidth = 2; 
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

class JosephusSimulation {
    constructor(delay) {
        this.cycle = 0;
        this.mod_removedc = [];
        this.delay = delay;
    }

    async drawBeadandSpiral(x, y, r, R, n, removed) {
        let center = [x, y+R]; // imaginary center of bead
        let removedc = removed?.slice() ?? [];
        const step = 360/n;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Draw the outer beads
        function drawCircle(x, y, r=1, txt='', val='lightgrey') {
            ctx.beginPath(); 
            ctx.arc(x, y, r, 0, 2*Math.PI);  
            ctx.fillStyle = val; 
            ctx.fill(); 
            ctx.strokeStyle = 'black'; 
            ctx.stroke(); 
            ctx.font = `${r}px Arial`;
            ctx.fillStyle = 'black';
            ctx.fillText(txt, x, y);
        }
        function drawSpoke(x, y, len=R-r) {
            ctx.beginPath();
            ctx.moveTo(center[0], center[1]);
            let dx = x - center[0], dy = y - center[1];
            let length = Math.sqrt(dx * dx + dy * dy);
            let scale = len / length;
            let endx = center[0] + dx * scale;
            let endy = center[1] + dy * scale;
            ctx.lineTo(endx, endy);
            ctx.stroke();
        }
        for (let i = 0; i < n; i++) {
            const angle = i * step * Math.PI / 180;
            let centerX = center[0] + R*Math.cos(angle);
            let centerY = center[1] + R*Math.sin(angle);
            if (removedc.includes(i+1))    drawCircle(centerX, centerY, r, i+1, 'red');
            else if (removedc.length == n-1) drawCircle(centerX, centerY, r, i+1, 'green');
            else                           drawCircle(centerX, centerY, r, i+1);
            drawSpoke(centerX, centerY)
        }
    
        // Draw the spiral
        function drawDot(x, y, r, val='green') {
            ctx.beginPath(); 
            ctx.arc(x, y, r, 0, 2*Math.PI); 
            ctx.fillStyle = val; 
            ctx.fill(); 
            ctx.strokeStyle = 'black'; 
            ctx.stroke(); 
        }
        function drawArc(i, currentR){
            ctx.beginPath();
            ctx.arc(center[0], center[1], currentR, 
                    (2*Math.PI*i)/(n), 
                    (2*Math.PI*(i+1))/(n));
            ctx.stroke();
        }

        // Find if cycle has shifted, then update the mod_removedc array
        let last_elem        = removedc[removedc.length-1];
        let second_last_elem = removedc[removedc.length-2];
        if (second_last_elem > last_elem) 
            this.cycle++;
        last_elem = this.cycle*n + last_elem;
        // removedc array     = [3,6,9,12,15,4,8,...]
        // mod_removedc array = [3,6,9,12,15,19,22,...]
        // It contains the exact spiral index to be coloured
        this.mod_removedc.push(last_elem);

        // A Set of "active" families
        const activeFamilies = new Set();

        // A function to check if a number should be colored
        const shouldColor = (num) => {
            const family = num % n;
            if (this.mod_removedc.includes(num)) {
                activeFamilies.add(family);
            }
            return activeFamilies.has(family);
        };
        for (let i = 0; i < last_elem; i++) {
            const angle = i * step * Math.PI / 180;
            const currentR = Math.max(0, R - 2*r - (i * 0.15 * (R / n))); // Reduce R gradually to form a spiral
            const currentr = Math.max(5, r/4);
            const currentX = center[0] + currentR * Math.cos(angle);
            const currentY = center[1] + currentR * Math.sin(angle);
            if (n >= 5) drawArc(i, currentR);

            if (shouldColor(i+1)) {
                drawDot(currentX, currentY, currentr, 'red');
            } 
            else drawDot(currentX, currentY, currentr);
        }
        await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    // Josephus simulation with a list O(n^2) O(n)
    async josephus(n, k) {
        this.cycle = 0;
        this.mod_removedc = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let arr = Array.from({ length: n }, (_, index) => index + 1);
        let start_index = 0;
        let rarr = [];
    
        while (arr.length > 1) {
            let removal_index = (start_index + k - 1) % arr.length;
            rarr.push(arr[removal_index]);
            arr.splice(removal_index, 1);
            start_index = removal_index;

            const radius = parseInt(r_circles.value, 10); 
            const outerRadius = parseInt(R_circles.value, 10); 
            const centerX = canvas.width / 2; 
            const centerY = (canvas.height / 2) - outerRadius; 

            
            await this.drawBeadandSpiral(centerX, centerY, radius, outerRadius, n, rarr);
        }
    
        return arr[0];
    }
}


/////////////////// Adding event listeners to the sliders ///////////////////
const delay_c           = document.getElementById('delay');
const delay_Display     = document.getElementById('delay-count');
const n_circles         = document.getElementById('n-circles');
const n_circles_Display = document.getElementById('n-circles-count');
const k_val             = document.getElementById('k-val');
const k_val_Display     = document.getElementById('k-val-count');
const R_circles         = document.getElementById('R-circles');
const R_circles_Display = document.getElementById('R-circles-val');
const r_circles         = document.getElementById('r-circles');
const r_circles_Display = document.getElementById('r-circles-val');
const playButton        = document.getElementById('play-button');


function updateCanvas(new_n, new_k) {
    const _n = parseInt(n_circles.value, 10);
    const _R = parseInt(R_circles.value, 10);
    const _r = parseInt(r_circles.value, 10);
    const _k = parseInt(k_val.value, 10);
    const _d = parseInt(delay_c.value, 10);
    const centerX = canvas.width / 2; 
    const centerY = canvas.height / 2 - _R; 
    n_circles_Display.textContent = _n;
    R_circles_Display.textContent = _R;
    r_circles_Display.textContent = _r;
    k_val_Display.textContent     = _k;
    delay_Display.textContent     = _d;
    var simulation = new JosephusSimulation(_d);
    simulation.drawBeadandSpiral(centerX, centerY, _r, _R, _n);
    if (new_n && new_k) {
        simulation.josephus(new_n, new_k);
    }
}

// Initial drawing
updateCanvas();

// Update the canvas when the slider value changes
n_circles.addEventListener('input', () => {
    const nValue = parseInt(n_circles.value, 10);
    n_circles_Display.textContent = nValue;

    // Adjust the maximum value of k-val to be less than nValue
    k_val.max = nValue - 1;
    if (parseInt(k_val.value, 10) >= nValue) {
        k_val.value = nValue - 1;
    }
    k_val_Display.textContent = k_val.value;
    updateCanvas();
});
R_circles.addEventListener('input', updateCanvas);
r_circles.addEventListener('input', updateCanvas);
k_val.addEventListener('input', updateCanvas);
delay_c.addEventListener('input', updateCanvas);


playButton.addEventListener('click', async () => {
    const _n = parseInt(n_circles.value, 10);
    const _k = parseInt(k_val.value, 10);
    updateCanvas(_n, _k);
});

/////////////////////////// Refresh page ///////////////////////////
const refreshButton = document.getElementById('refreshButton');
refreshButton.addEventListener('click', () => { location.reload();});
///////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////
const canvas2 = document.getElementById('canvas2');
const zoomInButton = document.getElementById('zoomInButton');
const zoomOutButton = document.getElementById('zoomOutButton');
const ctx2 = canvas2.getContext('2d');
ctx2.textAlign = 'center';
ctx2.textBaseline = 'middle';


function isPrime(num) {
    if (num <= 1) return false; // Numbers less than or equal to 1 are not prime
    if (num <= 3) return true;  // 2 and 3 are prime numbers

    // Eliminate even numbers and multiples of 3
    if (num % 2 === 0 || num % 3 === 0) return false;

    // Check for factors from 5 up to the square root of the number
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }

    return true; // If no factors were found, the number is prime
}

let tot_count = 0, target_count = 0;

async function printArray(arr, hidx=-1, topidx=true) {
    await new Promise(resolve => setTimeout(resolve, delay));
    let _i = 0;

    function printRect(x, y, s, txt, highlighted=false) {
        if (highlighted)  ctx2.fillStyle = 'red';
        else              ctx2.fillStyle = 'lightgrey';
        ctx2.fillRect(x, y, s, s);
        ctx2.fillStyle = 'black';
        // ctx2.strokeRect(x, y, s, s);
        ctx2.font = '20px Arial';
        // ctx2.fillText(txt, x + s/2, y + s/2);
    }

    ctx2.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i]) && arr[i][0].length > 0) {
            // 2D array
            for (var j = 0; j < arr[i].length; j++) {
                tot_count++;
                if (isPrime(arr[i][j]))  {
                    printRect(x + j*s, y + i*s, s, arr[i][j], highlighted=true);
                    target_count++;
                }
                else                  
                    printRect(x + j*s, y + i*s, s, arr[i][j]);
                // ctx2.font = '15px Arial';
                // if (i == 0)  ctx2.fillText(j, x + s/2 + j*s, y-10);
            }
            // ctx2.fillText(i, x-10, y + s/2 + i*s);
        } else {  // 1D array
            if (i == hidx) printRect(x + i*s, y, s, arr[i], highlighted=true);
            else           printRect(x + i*s, y, s, arr[i]);
            // ctx2.font = '15px Arial';
            // ctx2.fillText(i, x + s/2 + i*s, y-10);
        }
    }
    // console.log(arr);
    console.log(target_count + "/" + tot_count + "=" + target_count/tot_count); 
}


// async function bubbleSort(arr) {
//     const n = arr.length;
//     for (i = 0; i < n - 1; i++) {
//         swapped = false;
//         for (j = 0; j < n - i - 1; j++) {
//             if (arr[j] > arr[j + 1]) {
//                 // Swap arr[j] and arr[j+1]
//                 await printArray(arr, j);
//                 temp = arr[j];
//                 arr[j] = arr[j + 1];
//                 arr[j + 1] = temp;
//                 swapped = true;
//                 await printArray(arr, j+1);
//             }
//         }
//         if (swapped == false) break;
//     }
//     await printArray(arr);
//     return arr;
// }



var s = 1, x = 20, y = 20, delay = 750;

function drawTable(x) {
    function winner(n,k) {
        let ans = 0;
        for (let i = 2; i < n+1; ++i) {
            ans = (ans + k) % i;
        }
        return ans + 1;
    }
    let m = x, n = x;
    arr = Array.from({ length: m }, () => Array(n).fill(' '));
    for (let i = 2; i < m; i++){
        for (let j = 2; j < i; j++){
            arr[i][j] = winner(i,j);
        }
    }
    return arr
}
arr = drawTable(100);
printArray(arr)

