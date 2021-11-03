# netpascraper
Webscraper for netpa university scheduling system, scraping the schedule to pass the data into a .ics file

First of all, this was a fun side project to help get the schedule data into a normal calendar from netpa (i.e. used by NOVA Sbe in Lisbon)


# Installation

You will have to install dependencies using `npm install`. The node version is set via the package.json engine. 

You also have to setup an .env file by copying the .sampleenv and filling in your desired data. 

# Environment Variables

You have to supply your password and email address so the scraper can login to your account. Furthermore, specify the number of weeks you want the scraper to go through the calendar. 

For now this will only work correctly until the 01.11.2022, then the code will mess up the the year. This is certainly fixable, but wasn't needed for the usecase right now.


# Usage

Just run `npm run start` after having supplied the env file. If it doesn't work, consider running puppeteer in headfull mode to see where it gets stuck :)

