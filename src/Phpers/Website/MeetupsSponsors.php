<?php

namespace Phpers\Website;

class MeetupsSponsors
{
    /**
     * @var Meetup[]
     */
    private $meetups = [];
    /**
     * @var Sponsor[]
     */
    private $sponsors = [];
    
    public function __construct(array $meetups)
    {
        $this->meetups = $meetups;
    }

    public function all()
    {
        if ($this->sponsors) {
            return array_values($this->sponsors);
        }
        
        foreach ($this->meetups as $meetup) {
            $this->addSponsorsFrom($meetup);
        }
       
        $sponsors = array_unique($this->sponsors);
        natcasesort($sponsors);

        return array_values($sponsors);
    }

    private function addSponsorsFrom(Meetup $meetup)
    {
        foreach ($meetup->sponsors() as $sponsor) {
            $this->addSponsorIfNewOne($sponsor);
            $this->replaceSponsorIfCurrentOneHasSiteUrl($sponsor);
        }
    }

    private function replaceSponsorIfCurrentOneHasSiteUrl(Sponsor $sponsor)
    {
        if (isset($this->sponsors[$sponsor->name()]) && $sponsor->websiteUrl()) {
            $this->sponsors[$sponsor->name()] = $sponsor;
        }
    }

    private function addSponsorIfNewOne(Sponsor $sponsor)
    {
        if (!isset($this->sponsors[$sponsor->name()])) {
            $this->sponsors[$sponsor->name()] = $sponsor;
        }
    }
}