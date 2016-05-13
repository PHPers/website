<?php

namespace Phpers\Website;

class MeetupsTalksTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @test
     */
    public function it_returns_unique_ordered_list_of_all_talks_for_meetups()
    {
        $meetup1 = $this->prophesize(Meetup::class);
        $meetup1->talks()->willReturn([
            new Talk('Taming Command Bus', 'desc'),
            new Talk('Event store', 'desc2'),
        ]);
        
        $meetup2 = $this->prophesize(Meetup::class);
        $meetup2->talks()->willReturn([
            new Talk('Taming Command Bus', 'desc'),
            new Talk('Event store', 'desc2'),
        ]);
        
        $meetup3 = $this->prophesize(Meetup::class);
        $meetup3->talks()->willReturn([
            new Talk('Taming Command Bus', 'desc'),
            new Talk('Event store', 'desc2'),
        ]);
        
        $meetupTalks = new MeetupsTalks([
            $meetup1->reveal(),
            $meetup2->reveal(),
            $meetup3->reveal(),
        ]);
        
        $sponsors = $meetupTalks->all();
        $this->assertEquals([
            new Talk('Taming Command Bus', 'desc'),
            new Talk('Event store', 'desc2'),
            new Talk('Taming Command Bus', 'desc'),
            new Talk('Event store', 'desc2'),
            new Talk('Taming Command Bus', 'desc'),
            new Talk('Event store', 'desc2')
        ], $sponsors);
    }
}
