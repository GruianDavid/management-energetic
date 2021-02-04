$(document).ready(function (){
    let isc = 6
    let ki = 0.001
    let t = 300
    let lr = 1000
    let lm = 1000
    let q = 1.602E-19
    let n = 1
    let k = 1.38E-23
    let l0 = isc/(Math.exp(q*0.6/n/k/t)-1) //ok
    console.log(l0)
    let Rs = 0.5
    let Rsh = 1000

    let valueToBeRead = 0.4
    let xn1 = 0
    let fx = (isc+ki*(t-273))*lr/lm-l0*(Math.exp(q*(valueToBeRead+Rs*xn1)/n/k/t)-1)-(valueToBeRead+Rs*xn1)/Rsh-xn1 //ok
    console.log(fx)
})