(function(){function e(e,t=100){return e>t?Math.floor(e/t):t}function t(e){let t=-1;return function(n,r,i){if(i!==0&&n%i===0){let i=Math.floor(n/r*100);t!==i&&(t=i,e(i))}}}(function(){let n=t(e=>{postMessage({type:`progress`,data:e})});function r(t,n=100){return e(t,n)}function i(e){return e===0||e?e.toLocaleString(`en-US`):`<span class="font-danger">Error!</span>`}self.onmessage=function(e){try{let[t,a,o,s]=e.data,c=null;if(o===0)c=t.join(`, `).replace(/, ((?:.(?!, ))+)$/,` and $1`);else{let e=[],o=t.length>2?Math.floor(t.length/2):t.length;if(s===1){let s=r(o);for(let r=0;r<o;r++)e.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${i(t[r])}</td>
                        <td>=</td>
                        <td>${i(a/t[r])}</td>
                    </tr>
                `),n(r,o,s)}else for(let n=0;n<o;n++)e.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${i(t[n])}</td>
                        <td>=</td>
                        <td>${i(a/t[n])}</td>
                    </tr>
                `);c=`<div class="scrollable"><table>${e.join(``)}</table></div>`}postMessage({type:`data`,data:c})}catch(e){postMessage({type:`error`,error:String(e&&typeof e==`object`&&`message`in e?e.message:e)})}}})()})();