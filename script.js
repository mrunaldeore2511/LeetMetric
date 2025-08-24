document.addEventListener("DOMContentLoaded", function () {

    const searchButton = document.getElementById("searchBtn");
    const usernameInput = document.getElementById("inputBox");
    const statsContainer = document.querySelector(".statsContainer");
    const easyProgressCircle = document.querySelector(".easyProgress circle");
    const medProgreeCircle = document.querySelector(".mediumProgress circle");
    const hardProgressCircle = document.querySelector(".hardProgress circle");
    const easyLabel = document.getElementById("easyLabel");
    const medLabel = document.getElementById("mediumLabel");
    const hardLabel = document.getElementById("hardLabel");


    //function to validate the username
    function validateUsername(userName) {

        if (userName === "") {
            alert("Username is empty!");
            return false;
        }

        const regex = /^[a-zA-Z0-9_-]+$/;
        const isMathching = regex.test(userName);

        if (!isMathching) {
            alert("Invalid Username!");
            return isMathching;
        }
        return isMathching;
    }


    async function fetchUserDetail(userName) {

        

        try {

            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const proxyUrl = "https://cors-anywhere.herokuapp.com/";
            const targeturl = "https://leetcode.com/graphql/";

            const myHeader = new Headers();
            myHeader.append('content-type', 'application/json');

            const graphql = JSON.stringify({
                query: "\n  query userSessionProgress($username: String!) {\n    allQuestionsCount {\n      difficulty\n      count\n    }\n    matchedUser(username: $username) {\n      submitStats {\n        acSubmissionNum {\n          difficulty\n          count\n          submissions\n        }\n        totalSubmissionNum {\n          difficulty\n          count\n          submissions\n        }\n      }     \n    }\n  }\n",
                variables: { "username": `${userName}` }
            });


            const reponseOptions ={
                method: "POST",
                headers :myHeader,
                body : graphql,
                redirect: "follow"
            }

            const response = await fetch(proxyUrl+targeturl, reponseOptions);
            
            if (!response.ok) {
                throw new Error("Unable to fetch user details");
            }

            const parseddata = await response.json();
            console.log("Loggging Data: ", parseddata);
            displayUserData(parseddata);
        }
        catch (error) {
            statsContainer.innerHTML = "No Data Found";
        }
        finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }


    }

    function displayUserData(parseddata){
        const totalQues = parseddata.data.allQuestionsCount[0].count;
        const totalEasyQues = parseddata.data.allQuestionsCount[1].count;
        const totalMediumQues = parseddata.data.allQuestionsCount[2].count;
        const totalHardQues = parseddata.data.allQuestionsCount[3].count;

        const solvedQues = parseddata.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedEasyQues = parseddata.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMediumQues = parseddata.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedHardQues = parseddata.data.matchedUser.submitStats.acSubmissionNum[3].count;

        const easyProgress = document.querySelector(".easyProgress");
        const medProgress = document.querySelector(".mediumProgress");
        const hardProgress = document.querySelector(".hardProgress");

        updateProgress(solvedEasyQues, totalEasyQues, easyLabel, easyProgress);
        updateProgress(solvedMediumQues, totalMediumQues, medLabel, medProgress);
        updateProgress(solvedHardQues, totalHardQues, hardLabel, hardProgress);

        const cardData = [
            {label: "Overall Submissions ", value: parseddata.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {label: "Overall Easy Submissions ", value: parseddata.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {label: "Overall Medium Submissions ", value: parseddata.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {label: "Overall Hard Submissions ", value: parseddata.data.matchedUser.submitStats.totalSubmissionNum[3].submissions}
        ];           
        
        console.log("Card Data: ", cardData);

        const cardContainer = document.querySelector(".cardConatainer");
        cardContainer.innerHTML = cardData.map( 
            data => {
                return `<div class="card">
                            <h3>${data.label}</h3>
                            <p>${data.value}</p>
                        </div>`
            }
        ).join("");
    }

    function updateProgress(solved, total, label, circle){
        const progressDegree = (solved/total)*100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    searchButton.addEventListener('click', function () {
        const userName = usernameInput.value;
        console.log("Logging Username, " + userName);

        if (validateUsername(userName)) {
            fetchUserDetail(userName);
        }
    })

});