<?php

namespace Phpers\Website;

class Meetup
{
    private static $categoriesToCityNames = [
        'bielsko-biala' => 'Bielsko-Biała',
        'trojmiasto' => 'Trójmiasto',
        'slask' => 'Śląsk',
        'lodz' => 'Łódź',
        'krakow' => 'Kraków',
        'warszawa' => 'Warszawa',
        'rzeszow' => 'Rzeszów',
        'poznan' => 'Poznań',
        'torun' => 'Toruń'
    ];

    private $sponsors = [];
    private $speakers = [];
    private $talks = [];
    private $city = null;
    
    private function __construct()
    {
    }

    /**
     * @param array $meetupArray
     * @return Meetup
     */
    public static function fromArray(array $meetupArray)
    {
        $latitude = 0;
        $longitude = 0;

        if (isset($meetupArray['venue']['location'])) {
            $latLong = explode(',', $meetupArray['venue']['location']);
            $latitude = trim($latLong[0]);
            $longitude = trim($latLong[1]);
        }
        
        $meetup = new Meetup();
        $cityName = self::getCityName($meetupArray);
        $meetup->city = new City($cityName, $latitude, $longitude);
        self::addSponsors($meetup, $meetupArray);
        self::addSpeakers($meetup, $meetupArray);
        self::addTalks($meetup, $meetupArray);
        
        return $meetup;
    }
    
    private static function addSponsors(Meetup $meetup, array $meetupArray)
    {
        if (!isset($meetupArray['sponsors'])) {
            return;
        }
        
        if (!is_array($meetupArray['sponsors'])) {
            return;
        }
        
        foreach ($meetupArray['sponsors'] as $sponsor) {
            $name = $sponsor['name'];
            $logo = isset($sponsor['logo']) ? $sponsor['logo'] : '';
            $site = isset($sponsor['site']) ? $sponsor['site'] : '';

            $meetup->sponsors[] = new Sponsor($name, $logo, $site);
        }
    }
    
    private static function addSpeakers(Meetup $meetup, array $meetupArray)
    {
        if (!isset($meetupArray['talks'])) {
            return;
        }

        if (!is_array($meetupArray['talks'])) {
            return;
        }

        foreach ($meetupArray['talks'] as $talk) {
            if (isset($talk['speaker'])) {
                $meetup->speakers[] = new Speaker($talk['speaker']);
            }
        }
    }
    
    private static function addTalks(Meetup $meetup, array $meetupArray)
    {
        if (!isset($meetupArray['talks'])) {
            return;
        }

        if (!is_array($meetupArray['talks'])) {
            return;
        }

        foreach ($meetupArray['talks'] as $talk) {
            if (isset($talk['description'])) {
                $meetup->talks[] = new Talk($talk['title'], $talk['description']);
            }
        }
    }

    /**
     * @return Sponsor[]
     */
    public function sponsors()
    {
        return $this->sponsors;
    }
    
    /**
     * @return Speaker[]
     */
    public function speakers()
    {
        return $this->speakers;
    }

    /**
     * @return City
     */
    public function city()
    {
        return $this->city;
    }

    /**
     * @return Talk[]
     */
    public function talks()
    {
        return $this->talks;
    }

    private static function getCityName($meetupArray)
    {
        if (!is_array($meetupArray)) {
            return '';
        }

        if (isset($meetupArray['city'])) {
            return $meetupArray['city'];
        }

        return isset($meetupArray['categories'][0]) ? self::getCityNameFromCategoryName($meetupArray['categories'][0]) : '';
    }

    private static function getCityNameFromCategoryName($categoryName)
    {
        if (!$categoryName) {
            return '';
        }

        if (!isset(self::$categoriesToCityNames[$categoryName])) {
            return '';
        }

        return self::$categoriesToCityNames[$categoryName];
    }
}