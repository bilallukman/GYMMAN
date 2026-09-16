(function () {

    const username = window.LIFT?.username;

    if (!username) return;


    const btn =
        document.getElementById("calculateBtn");

    const result =
        document.getElementById("result");

    const heightInput =
        document.getElementById("height");

    const weightInput =
        document.getElementById("weight");


    /* =========================================
       UNIT HELPERS
    ========================================= */

    function getWeightUnit() {

        if (
            window.LIFT &&
            typeof window.LIFT.getWeightUnit === "function"
        ) {
            return window.LIFT.getWeightUnit();
        }

        return "kg";
    }


    function getHeightUnit() {

        if (
            window.LIFT &&
            typeof window.LIFT.getHeightUnit === "function"
        ) {
            return window.LIFT.getHeightUnit();
        }

        return "cm";
    }


    function lbToKg(lb) {

        if (
            window.LIFT &&
            typeof window.LIFT.lbToKg === "function"
        ) {
            return window.LIFT.lbToKg(lb);
        }

        return Number(lb) / 2.2046226218;
    }


    function ftToCm(ft) {

        if (
            window.LIFT &&
            typeof window.LIFT.ftToCm === "function"
        ) {
            return window.LIFT.ftToCm(ft);
        }

        return Number(ft) * 30.48;
    }


    function updateUnitLabels() {

        const heightLabel =
            document.querySelector(
                'label[for="height"]'
            );

        const weightLabel =
            document.querySelector(
                'label[for="weight"]'
            );


        const heightUnit =
            getHeightUnit();

        const weightUnit =
            getWeightUnit();


        if (heightLabel) {

            heightLabel.textContent =
                heightUnit === "ft"
                    ? "Height (ft)"
                    : "Height (cm)";
        }


        if (weightLabel) {

            weightLabel.textContent =
                weightUnit === "lb"
                    ? "Weight (lb)"
                    : "Weight (kg)";
        }


        if (heightInput) {

            heightInput.placeholder =
                heightUnit === "ft"
                    ? "e.g. 5.9"
                    : "e.g. 180";
        }


        if (weightInput) {

            weightInput.placeholder =
                weightUnit === "lb"
                    ? "e.g. 160"
                    : "e.g. 72";
        }
    }


    /* =========================================
       BMI CATEGORY
    ========================================= */

    function category(bmi) {

        if (bmi < 18.5) {
            return "Below the standard BMI range";
        }

        if (bmi < 25) {
            return "Within the standard BMI range";
        }

        if (bmi < 30) {
            return "Above the standard BMI range";
        }

        return "30 or above";
    }


    /* =========================================
       CALCULATE BMI
    ========================================= */

    btn.addEventListener(
        "click",
        async () => {

            const enteredHeight =
                parseFloat(
                    heightInput.value
                );

            const enteredWeight =
                parseFloat(
                    weightInput.value
                );


            if (
                !enteredHeight ||
                !enteredWeight ||
                enteredHeight <= 0 ||
                enteredWeight <= 0
            ) {

                result.className =
                    "empty-state";

                result.innerHTML = `
                    <h3>
                        Enter valid measurements
                    </h3>

                    <p>
                        Please enter a height and weight greater than zero.
                    </p>
                `;

                return;
            }


            /*
                DATABASE STANDARD:

                Height → CM
                Weight → KG

                User can enter:
                CM + KG
                CM + LB
                FT + KG
                FT + LB

                Everything is converted internally
                before BMI calculation.
            */


            let heightCm =
                enteredHeight;

            let weightKg =
                enteredWeight;


            /* HEIGHT CONVERSION */

            if (
                getHeightUnit() === "ft"
            ) {

                heightCm =
                    ftToCm(
                        enteredHeight
                    );
            }


            /* WEIGHT CONVERSION */

            if (
                getWeightUnit() === "lb"
            ) {

                weightKg =
                    lbToKg(
                        enteredWeight
                    );
            }


            /* =================================
               BMI FORMULA
            ================================= */

            const bmi =
                Number(
                    (
                        weightKg /
                        Math.pow(
                            heightCm / 100,
                            2
                        )
                    ).toFixed(1)
                );


            btn.disabled =
                true;

            btn.textContent =
                "Saving...";


            try {

                await window.LIFT.post(
                    "/bmi",
                    {
                        username,

                        // Always store standard units
                        bmi,

                        height:
                            Number(
                                heightCm.toFixed(2)
                            ),

                        weight:
                            Number(
                                weightKg.toFixed(3)
                            )
                    }
                );


                result.className =
                    "empty-state";


                result.innerHTML = `

                    <h3
                        style="
                            font-size:42px;
                            color:var(--text-primary);
                        "
                    >
                        ${bmi}
                    </h3>

                    <p>
                        ${category(bmi)}.
                        Your result has been saved to LIFT.
                    </p>

                    <small
                        style="
                            display:block;
                            margin-top:10px;
                            opacity:.7;
                        "
                    >
                        ${enteredWeight} ${getWeightUnit()}
                        ·
                        ${enteredHeight} ${getHeightUnit()}
                    </small>

                `;


                window.LIFT.toast(
                    "BMI saved successfully."
                );


            } catch (e) {

                result.className =
                    "empty-state";


                result.innerHTML = `

                    <h3>
                        Unable to save BMI
                    </h3>

                    <p>
                        ${window.LIFT.escape(
                            e.message
                        )}
                    </p>

                `;


            } finally {

                btn.disabled =
                    false;

                btn.textContent =
                    "Calculate BMI";
            }

        }
    );


    /* =========================================
       INITIALIZE
    ========================================= */

    updateUnitLabels();

})();