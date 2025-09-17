const screen = document.querySelector(".screen");
let curVal = 0;
let hasDot = false;

// AC
document.querySelector(".ac").addEventListener("click", () => {
    screen.innerHTML = "0";
    hasDot = false;
});

// DEL
document.querySelector(".del").addEventListener("click", () => {
    if(screen.innerHTML.length <= 1 || screen.innerHTML === "NaN" || screen.innerHTML === "undefined"){
        screen.innerHTML = "0";
        hasDot = false;
    } else {
        if(screen.innerHTML[screen.innerHTML.length-1] === ".") hasDot = false;
        screen.innerHTML = screen.innerHTML.slice(0,-1);
    }
});

// ANS
document.querySelector(".ans").addEventListener("click", () => {
    const lastChar = screen.innerHTML[screen.innerHTML.length-1];
    if(screen.innerHTML === "0" || screen.innerHTML === "NaN" || screen.innerHTML === "undefined"){
        screen.innerHTML = "Ans";
    } else if(["+", "−", "×", "÷", "^", "("].includes(lastChar)){
        screen.innerHTML += "Ans";
    }
});

// Numbers
document.querySelectorAll(".num").forEach(btn => {
    btn.addEventListener("click", () => {
        const val = btn.innerHTML;
        if(screen.innerHTML === "0" || screen.innerHTML === "NaN" || screen.innerHTML === "undefined"){
            screen.innerHTML = val;
        } else {
            screen.innerHTML += val;
        }
    });
});

// Dot
document.querySelector(".dot").addEventListener("click", () => {
    if(!hasDot){
        if(screen.innerHTML === "0" || screen.innerHTML === "NaN" || screen.innerHTML === "undefined"){
            screen.innerHTML = "0.";
        } else {
            screen.innerHTML += ".";
        }
        hasDot = true;
    }
});

// Operators
document.querySelectorAll(".op").forEach(op => {
    op.addEventListener("click", () => {
        const val = op.innerHTML;
        if(screen.innerHTML === "NaN" || screen.innerHTML === "undefined") screen.innerHTML = "0";
        const lastChar = screen.innerHTML[screen.innerHTML.length-1];
        if(["+", "−", "×", "÷", "^"].includes(lastChar)){
            screen.innerHTML = screen.innerHTML.slice(0,-1) + val;
        } else if(screen.innerHTML === "0"){
            if(val === "(") screen.innerHTML = "(";
        } else {
            screen.innerHTML += val;
        }
        hasDot = false;
    });
});

// Constants
document.querySelectorAll(".constant").forEach(btn => {
    btn.addEventListener("click", () => {
        const val = btn.innerHTML;
        const lastChar = screen.innerHTML[screen.innerHTML.length-1];
        if(screen.innerHTML === "NaN" || screen.innerHTML === "undefined") screen.innerHTML = "0";
        if(screen.innerHTML === "0" || ["+", "−", "×", "÷", "^", "("].includes(lastChar)){
            screen.innerHTML = (screen.innerHTML === "0") ? val : screen.innerHTML + val;
        } else {
            screen.innerHTML += val;
        }
        hasDot = false;
    });
});

// Functions
document.querySelectorAll(".func").forEach(btn => {
    btn.addEventListener("click", () => {
        const val = btn.innerHTML;
        const lastChar = screen.innerHTML[screen.innerHTML.length-1];
        if(screen.innerHTML === "NaN" || screen.innerHTML === "undefined") screen.innerHTML = "0";
        if(screen.innerHTML === "0" || ["+", "−", "×", "÷", "^", "("].includes(lastChar)){
            screen.innerHTML = (screen.innerHTML === "0") ? val+"(" : screen.innerHTML + val + "(";
        }
        hasDot = false;
    });
});

// Equal
document.querySelector(".equal").addEventListener("click", () => {
    let expr = screen.innerHTML
        .replace(/×/g,"*")
        .replace(/÷/g,"/")
        .replace(/−/g,"-")
        .replace(/Ans/g,curVal.toString())
        .replace(/π/g,Math.PI.toString())
        .replace(/e/g,Math.E.toString())
        .replace(/sin\(/g,"s(")
        .replace(/cos\(/g,"c(")
        .replace(/tan\(/g,"t(");

    try {
        let result = evaluate(expr);
        if(isNaN(result) || result === undefined) result = 0;
        screen.innerHTML = result;
        curVal = result;
    } catch {
        screen.innerHTML = "0";
    }
});

// Evaluate using Shunting Yard
const precedence = (op) => {
    if(op==="s"||op==="c"||op==="t") return 4;
    if(op==="^") return 3;
    if(op==="*"||op==="/") return 2;
    if(op==="+"||op==="-") return 1;
    return 0;
}

const applyOp = (a,b,op)=>{
    switch(op){
        case "+": return a+b;
        case "-": return a-b;
        case "*": return a*b;
        case "/": return a/b;
        case "^": return Math.pow(a,b);
        case "s": return Math.sin(a);
        case "c": return Math.cos(a);
        case "t": return Math.tan(a);
        default: return 0;
    }
}

const evaluate = (expr)=>{
    let tokens = expr.match(/\d+(\.\d+)?|s|c|t|[+\-*/^()]/g);
    if(!tokens) return 0;

    let output = [];
    let ops = [];

    tokens.forEach(t=>{
        if(!isNaN(t)){
            output.push(parseFloat(t));
        } else if(t==="s"||t==="c"||t==="t"){
            ops.push(t);
        } else if(t==="("){
            ops.push(t);
        } else if(t===")"){
            while(ops.length && ops[ops.length-1]!=="("){
                output.push(ops.pop());
            }
            ops.pop();
        } else {
            while(ops.length && precedence(ops[ops.length-1])>=precedence(t)){
                output.push(ops.pop());
            }
            ops.push(t);
        }
    });

    while(ops.length) output.push(ops.pop());

    let st=[];
    output.forEach(t=>{
        if(typeof t==="number"){
            st.push(t);
        } else {
            if(t==="s"||t==="c"||t==="t"){
                let a = st.top();
                st.push(applyOp(a, 0, t));
            } else {
                let b=st.pop();
                let a=st.pop();
                st.push(applyOp(a,b,t));
            }
        }
    });

    return st.length>0 ? st[0] : 0;
}
