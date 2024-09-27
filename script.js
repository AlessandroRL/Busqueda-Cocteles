async function searchCocktail() {
    const name = document.getElementById('searchByName').value;
    const category = document.getElementById('searchByCategory').value;
    const ingredient = document.getElementById('searchByIngredient').value;

    let url = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=' + name;
    if (category) {
        url = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=' + category;
    } else if (ingredient) {
        url = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=' + ingredient;
    }

    const response = await fetch(url);
    const data = await response.json();

    const cocktailContainer = document.getElementById('cocktailContainer');
    cocktailContainer.innerHTML = '';
    document.getElementById('message').innerText = '';

    if (data.drinks === null) {
        document.getElementById('message').innerText = 'No se encontraron cócteles.';
        return;
    }

    data.drinks.forEach(cocktail => {
        cocktailContainer.innerHTML += `
            <div class="cocktail-card">
                <h3>${cocktail.strDrink}</h3>
                <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}">
                <button onclick="getCocktailDetails('${cocktail.idDrink}')">Detalles</button>
            </div>
        `;
    });
}

async function getCocktailDetails(id) {
    const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=' + id);
    const data = await response.json();

    if (data.drinks) {
        const cocktail = data.drinks[0];
        const ingredientsList = Object.keys(cocktail)
            .filter(key => key.startsWith('strIngredient') && cocktail[key])
            .map((key, index) => {
                const ingredientName = cocktail[key];
                const measure = cocktail['strMeasure' + (index + 1)];
                const ingredientImage = `https://www.thecocktaildb.com/images/ingredients/${ingredientName.toLowerCase().replace(/ /g, "_")}-Small.png`;
                return `<li onclick="getIngredientDetails('${ingredientName}')" style="cursor: pointer;">${ingredientName} (${measure}) <img src="${ingredientImage}" alt="${ingredientName}" style="width: 30px; height: 30px;"></li>`;
            })
            .join('');

        const cocktailDetails = `
            <div class="cocktail-details">
                <h2>${cocktail.strDrink}</h2>
                <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}">
                <h4>Preparación:</h4>
                <p>${cocktail.strInstructions}</p>
                <h4>Ingredientes:</h4>
                <ul>${ingredientsList}</ul>
            </div>
        `;

        document.getElementById('cocktailContainer').innerHTML = cocktailDetails;
    } else {
        document.getElementById('message').innerText = 'No se encontraron detalles del cóctel.';
    }
}

async function getIngredientDetails(ingredientName) {
    const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/search.php?i=' + ingredientName);
    const data = await response.json();

    if (data.ingredients) {
        const ingredient = data.ingredients[0];
        const ingredientDetails = `
            <div class="ingredient-details">
                <h2>${ingredient.strIngredient}</h2>
                <img src="${ingredient.strIngredientThumb}" alt="${ingredient.strIngredient}">
                <p>${ingredient.strDescription || 'Descripción no disponible.'}</p>
            </div>
        `;

        const newWindow = window.open("", "_blank");
        newWindow.document.write(`
            <html>
            <head>
                <title>${ingredient.strIngredient} - Detalles</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                </style>
            </head>
            <body>
                ${ingredientDetails}
            </body>
            </html>
        `);
        newWindow.document.close();
    } else {
        alert('No se encontraron detalles para este ingrediente.');
    }
}