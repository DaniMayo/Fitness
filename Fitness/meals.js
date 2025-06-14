const appId = 'e8379e61';
const appKey = '9c3c3907c5a5c85bca8c87b17aa1f65c';
const searchInput = document.getElementById('searchInput');
const resultsList = document.getElementById('resultsList');

// Calorie counters for each meal
let breakfastCalories = 0;
let lunchCalories = 0;
let dinnerCalories = 0;

// Food items selected for each meal
let selectedFoodForMeal = {
    breakfast: [],
    lunch: [],
    dinner: [],
};

document.getElementById('searchBtn').addEventListener('click', searchFood);

async function searchFood() {
    const query = searchInput.value.trim();
    if (!query) return;

    const response = await fetch(`https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
            'x-app-id': appId,
            'x-app-key': appKey,
        },
    });

    const data = await response.json();
    displayResults(data);
}

function displayResults(data) {
    resultsList.innerHTML = '';
    if (data && data.common) {
        data.common.forEach(item => {
            const li = document.createElement('li');
            const foodImage = item.photo ? item.photo.thumb : '';
            if (foodImage) {
                const img = document.createElement('img');
                img.src = foodImage;
                img.alt = item.food_name;
                img.classList.add('food-image');
                li.appendChild(img);
            }

            const text = document.createElement('span');
            text.textContent = `${item.food_name} - ${item.nf_calories} calories`;
            li.appendChild(text);

            const selectButton = document.createElement('button');
            selectButton.textContent = 'Select Food';
            selectButton.addEventListener('click', () => selectFood(item.food_name, item.nf_calories));
            li.appendChild(selectButton);

            resultsList.appendChild(li);
        });
    } else {
        resultsList.innerHTML = '<li>No results found. Try a different search.</li>';
    }
}

let selectedFood = {};

function selectFood(name, calories) {
    selectedFood = { name, calories };
    alert(`${name} selected! You can now add it to your meals.`);
}

function addToMeal(meal) {
    if (!selectedFood.name) {
        alert("Please select a food item first!");
        return;
    }

    selectedFoodForMeal[meal].push({ name: selectedFood.name, calories: selectedFood.calories });
    updateCalories(meal);

    const foodItem = document.createElement('li');
    foodItem.textContent = `${selectedFood.name} - ${selectedFood.calories} calories`;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => removeFood(meal, foodItem));
    foodItem.appendChild(removeBtn);

    document.getElementById(`${meal}List`).appendChild(foodItem);

    selectedFood = {}; // Clear the selected food item
}

function removeFood(meal, foodItem) {
    const index = selectedFoodForMeal[meal].findIndex(item => item.name === foodItem.textContent.split(' - ')[0]);
    if (index > -1) {
        selectedFoodForMeal[meal].splice(index, 1);
        foodItem.remove();
        updateCalories(meal);
    }
}

function updateCalories(meal) {
    const totalCalories = selectedFoodForMeal[meal].reduce((acc, food) => acc + food.calories, 0);
    document.getElementById(`${meal}Calories`).textContent = totalCalories;
}

document.getElementById('addBreakfastBtn').addEventListener('click', () => addToMeal('breakfast'));
document.getElementById('addLunchBtn').addEventListener('click', () => addToMeal('lunch'));
document.getElementById('addDinnerBtn').addEventListener('click', () => addToMeal('dinner'));
