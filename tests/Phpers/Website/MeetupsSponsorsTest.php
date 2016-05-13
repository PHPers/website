<?php

namespace Phpers\Website;

class MeetupsSponsorsTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @test
     */
    public function it_returns_unique_ordered_list_of_all_sponsors_for_meetups()
    {
        $meetup1 = $this->prophesize(Meetup::class);
        $meetup1->sponsors()->willReturn([
            new Sponsor('Cocoders', '/images/speaker/cocoders.jpg'),
            new Sponsor('MegiTeam', '/images/speaker/megiTeam.jpg'),
        ]);
        
        $meetup2 = $this->prophesize(Meetup::class);
        $meetup2->sponsors()->willReturn([
            new Sponsor('PGS', '/images/speaker/pgs.jpg'),
            new Sponsor('MegiTeam', '/images/speaker/megiTeam.jpg', 'http://megiteam.pl'),
        ]);
        
        $meetup3 = $this->prophesize(Meetup::class);
        $meetup3->sponsors()->willReturn([
            new Sponsor('PGS', '/images/speaker/pgs.jpg'),
            new Sponsor('MegiTeam', '/images/speaker/megiTeam.jpg', 'http://megiteam.pl'),
            new Sponsor('Cocoders', '/images/speaker/cocoders.jpg', 'http://cocoders.com')
        ]);
        
        $meetupSponsors = new MeetupsSponsors([
            $meetup1->reveal(),
            $meetup2->reveal(),
            $meetup3->reveal(),
        ]);
        
        $sponsors = $meetupSponsors->all();
        $this->assertEquals([
            new Sponsor('Cocoders', '/images/speaker/cocoders.jpg', 'http://cocoders.com'),
            new Sponsor('MegiTeam', '/images/speaker/megiTeam.jpg', 'http://megiteam.pl'),
            new Sponsor('PGS', '/images/speaker/pgs.jpg')
        ], $sponsors);
    }
}
