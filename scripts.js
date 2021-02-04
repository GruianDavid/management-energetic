$(document).ready(function (){
    let isc = 6
    let ki = 0.001
    let t = 300
    let Ir = 1000
    let Im = 1000
    let q = 1.602E-19
    let n = 1
    let k = 1.38E-23
    let I0 = isc/(Math.exp(q*0.6/n/k/t)-1)
    let Rs = 0.5
    let Rsh = 1000

    let valueToBeRead = 0.4
    // getWantedValueFor(0.4)

    for (let voltage = 1; voltage<20; voltage++){
        let current = getWantedValueFor(voltage/20)
        if (current < 0){
            break
        }
        console.log('Voltage: '+voltage/20+", Current: "+current+", Power: "+current*(voltage/20)+", Rezistenta: "+(voltage/20)/current)
    }

    function getWantedValueFor(valueToBeRead){
        let index = 0;
        let lastValue = 0
        let xn1 = 0
        let fx,f1x
        let consecutiveSameResults = 0;
        while (true){
            index ++;
            fx = (isc+ki*(t-273))*Ir/Im-I0*(Math.exp(q*(valueToBeRead+Rs*xn1)/n/k/t)-1)-(valueToBeRead+Rs*xn1)/Rsh-xn1
            f1x = -I0*q*Rs*Math.exp(q*(valueToBeRead+xn1*Rs)/k/n/t)/k/n/t-Rs/Rsh-1
            xn1 = xn1 - fx/f1x
            if (xn1.toFixed(14) === lastValue.toFixed(14)){
                consecutiveSameResults++
                if (consecutiveSameResults === 10){
                    console.log(index+" : "+lastValue)
                    return lastValue
                }
            }else{
                consecutiveSameResults = 0;
                lastValue = xn1
            }
            if (index === 250){
                return lastValue
            }
        }
    }

})