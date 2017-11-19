<?php

namespace Phpers\Website;

class MeetupsSpeakersTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @test
     */
    public function it_returns_unique_list_of_all_speakers_for_meetups()
    {
        $meetup1 = $this->prophesize(Meetup::class);
        $meetup1->speakers()->willReturn([
            new Speaker('Leszek Prabucki'),
            new Speaker('Mariusz Gil')
        ]);
        
        $meetup2 = $this->prophesize(Meetup::class);
        $meetup2->speakers()->willReturn([
            new Speaker('Adam Kowlaski'),
            new Speaker('Mariusz Gil')
        ]);
        
        $meetup3 = $this->prophesize(Meetup::class);
        $meetup3->speakers()->willReturn([
            new Speaker('Norbert Orzechowicz')
        ]);
        
        $meetupSpeakers = new MeetupsSpeakers([
            $meetup1->reveal(),
            $meetup2->reveal(),
            $meetup3->reveal()
        ]);
        
        $cities = $meetupSpeakers->all();
        $this->assertEquals([
            new Speaker('Adam Kowlaski'),
            new Speaker('Leszek Prabucki'),
            new Speaker('Mariusz Gil'),
            new Speaker('Norbert Orzechowicz')
        ], $cities);
    }
}
