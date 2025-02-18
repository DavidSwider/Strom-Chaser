import dotenv from 'dotenv';
//import fetch from 'node-fetch';
import dayjs, { type Dayjs} from 'dayjs';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Location {
  city: string;
  latitude: number;
  longitude: number;
  country: string;
  region: string;
}

class Weather {
  city: string;
  date: Dayjs | string;
   tempF: number;
   windSpeed: number;
   humidity: number;
   icon: string;
   iconDescription: string;
  
 
   constructor(city: string, date: Dayjs | string, tempF: number, windSpeed: number, humidity: number, icon: string, iconDescription: string) {
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
    this.iconDescription = iconDescription;
  }
}

class WeatherService {
  private apiEndpoint: string | undefined;
  private key: string | undefined;
  private currentCity = '';

  constructor() {
    this.apiEndpoint = process.env.API_BASE_URL;
    this.key = process.env.API_KEY;
  }

  private validateConfig(): void {
    if (!this.apiEndpoint || !this.key) {
      throw new Error('Missing API configuration.');
    }
  }

  private createLocationQuery(): string {
    return `${this.apiEndpoint}/geo/1.0/direct?q=${this.currentCity}&limit=1&appid=${this.key}`;
  }

  private createForecastQuery(location: Location): string {
    return `${this.apiEndpoint}/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&units=imperial&appid=${this.key}`;
  }

  private async fetchAPI(query: string): Promise<any> {
    try {
      const response = await fetch(query);
      if (!response.ok) {
        throw new Error(`Error fetching API: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Fetch Error:', error);
      throw new Error('Unable to fetch data from the API.');
    }
  }

  private extractLocation(data: any[]): Location {
    if (!data || data.length === 0) {
      throw new Error('No location data found.');
    }

    const { name: city, lat: latitude, lon: longitude, country, state: region } = data[0];
    return { city, latitude, longitude, country, region };
  }

  private parseWeatherResponse(response: any): Weather[] {
    const forecast: Weather[] = [];
    const filteredData = response.list.filter((entry: any) =>
      entry.dt_txt.includes('12:00:00')
    );

    for (const item of filteredData) {
      forecast.push(
        new Weather(
          this.currentCity,
          dayjs.unix(item.dt).format('M/D/YYYY'),
          item.main.temp,
          item.wind.speed,
          item.main.humidity,
          item.weather[0].icon,
          item.weather[0].description || item.weather[0].main
        )
      );
    }

    return forecast;
  }

  private parseCurrentWeather(data: any): Weather {
    const currentWeather = new Weather(
      this.currentCity,
      dayjs.unix(data.dt).format('M/D/YYYY'),
      data.main.temp,
      data.wind.speed,
      data.main.humidity,
      data.weather[0].icon,
      data.weather[0].description || data.weather[0].main
    );
    return currentWeather;
  }

  async getWeatherForCity(city: string): Promise<Weather[]> {
    try {
      this.validateConfig();
      this.currentCity = city;

      // Fetch location
      const locationData = await this.fetchAPI(this.createLocationQuery());
      const location = this.extractLocation(locationData);

      // Fetch weather
      const weatherData = await this.fetchAPI(this.createForecastQuery(location));
      const currentWeather = this.parseCurrentWeather(weatherData.list[0]);
      const forecast = this.parseWeatherResponse(weatherData);

      return [currentWeather, ...forecast];
    } catch (error) {
      console.error('Weather Service Error:', error);
      throw new Error('Unable to retrieve weather data.');
    }
  }
  
}

export default new WeatherService();

  // TODO: Define the baseURL, API key, and city name properties
  // TODO: Create fetchLocationData method
  // private async fetchLocationData(query: string) {}
  // TODO: Create destructureLocationData method
  // private destructureLocationData(locationData: Coordinates): Coordinates {}
  // TODO: Create buildGeocodeQuery method
  // private buildGeocodeQuery(): string {}
  // TODO: Create buildWeatherQuery method
  // private buildWeatherQuery(coordinates: Coordinates): string {}
  // TODO: Create fetchAndDestructureLocationData method
  // private async fetchAndDestructureLocationData() {}
  // TODO: Create fetchWeatherData method
  // private async fetchWeatherData(coordinates: Coordinates) {}
  // TODO: Build parseCurrentWeather method
  // private parseCurrentWeather(response: any) {}
  // TODO: Complete buildForecastArray method
  // private buildForecastArray(currentWeather: Weather, weatherData: any[]) {}
  // TODO: Complete getWeatherForCity method
  // async getWeatherForCity(city: string) {}
