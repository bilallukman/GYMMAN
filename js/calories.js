(function(){
    const username=window.LIFT?.username;if(!username)return; const btn=document.getElementById("calculateCalories");const result=document.getElementById("result");
    btn.addEventListener("click",async()=>{
        const weight=parseFloat(document.getElementById("weight").value);const minutes=parseFloat(document.getElementById("minutes").value);const activity=parseFloat(document.getElementById("activity").value);const select=document.getElementById("activity");const activityName=select.options[select.selectedIndex].text;
        if(!weight||!minutes||weight<=0||minutes<=0){result.innerHTML="<h3>Enter valid details</h3><p>Please enter a weight and duration greater than zero.</p>";return;}
        const calories=Math.round(activity*weight*(minutes/60));btn.disabled=true;btn.textContent="Saving...";
        try{await window.LIFT.post("/calories",{username,calories,activity:activityName,duration:minutes});result.innerHTML=`<h3 style="font-size:32px;color:#14213d">${calories} kcal</h3><p>Estimated calories burned from ${window.LIFT.escape(activityName)}. Saved to your activity history.</p>`;window.LIFT.toast("Calories saved successfully.");}
        catch(e){result.innerHTML=`<h3>Unable to save calories</h3><p>${window.LIFT.escape(e.message)}</p>`;}finally{btn.disabled=false;btn.textContent="Calculate calories";}
    });
})();
