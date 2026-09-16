(async function () {
    try {
        const data=await window.LIFT.get(`/user/${encodeURIComponent(window.LIFT.username)}`); const u=data.user; const items=[];
        if(u.workoutCount) items.push(["Training history",`${u.workoutCount} workout${u.workoutCount===1?"":"s"} logged in GYMMAN.`]);
        if(u.bmi!==null) items.push(["BMI updated",`Your latest saved BMI is ${u.bmi}.`]);
        if(u.calories) items.push(["Activity recorded",`${u.calories} kcal are recorded in your calorie history.`]);
        if(u.hasDiet) items.push(["Diet plan saved","Your latest meal and water plan is available in your Library."]);
        if(!items.length) items.push(["Welcome to GYMMAN","Start your first workout and your activity updates will appear here."]);
        document.getElementById("notificationsList").innerHTML=items.map(([title,text])=>`<article class="card notification"><div class="notification-icon">✓</div><div><strong>${window.LIFT.escape(title)}</strong><p>${window.LIFT.escape(text)}</p></div><time>Now</time></article>`).join("");
    }catch(e){window.LIFT.toast("Unable to load notifications.");}
})();
