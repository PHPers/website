<?php

namespace Phpers\Bundle\WebsiteBundle;

use Dflydev\DotAccessConfiguration\Configuration;
use Phpers\Website\Meetup;
use Phpers\Website\MeetupsCities;
use Phpers\Website\MeetupsSpeakers;
use Phpers\Website\MeetupsTalks;
use Sculpin\Contrib\ProxySourceCollection\ProxySourceItem;

class PhpersWebsiteTwigExtension extends \Twig_Extension
{
    private $meetups = [];
    
    public function getName()
    {
        return 'phpers_website_extension';
    }

    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('cities', array($this, 'fetchCities')),
            new \Twig_SimpleFilter('speakers', array($this, 'fetchSpeakers')),
            new \Twig_SimpleFilter('talks', array($this, 'fetchTalks'))
        );
    }

    public function fetchCities($posts)
    {
        $meetups = $this->convertToMeetups($posts);
       
        return (new MeetupsCities($meetups))->all();
    }
    
    public function fetchSpeakers($posts)
    {
        $meetups = $this->convertToMeetups($posts);

        return (new MeetupsSpeakers($meetups))->all();
    }
    
    public function fetchTalks($posts)
    {
        $meetups = $this->convertToMeetups($posts);

        return (new MeetupsTalks($meetups))->all();
    }

    private function convertToMeetups($posts)
    {
        if (!$posts) {
            return [];
        }

        if (! $this->meetups) {
            $this->meetups = $posts;
        }

        $meetups = [];
        /**
         * @var ProxySourceItem $post
         */
        foreach ($this->meetups as $post) {
            /**
             * @var Configuration $data
             */
            $data = $post->data();
            $meetups[] = Meetup::fromArray($data->exportRaw());
        }
        
        return $meetups;
    }
}
