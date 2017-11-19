<?php

namespace Phpers\Website;

class MeetupsCitiesTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @test
     */
    public function it_returns_unique_ordered_list_of_all_cities_for_meetups()
    {
        $meetup1 = $this->prophesize(Meetup::class);
        $meetup1->city()->willReturn(new City('Trójmiasto'));
        $meetup2 = $this->prophesize(Meetup::class);
        $meetup2->city()->willReturn(new City('Śląsk'));
        $meetup3 = $this->prophesize(Meetup::class);
        $meetup3->city()->willReturn(new City('Kraków'));
        
        $meetupCities = new MeetupsCities([
            $meetup1->reveal(),
            $meetup2->reveal(),
            $meetup3->reveal()
        ]);
        
        $cities = $meetupCities->all();
        $this->assertEquals([
            new City('Kraków'),
            new City('Śląsk'),
            new City('Trójmiasto')
        ], $cities);
    }
}
