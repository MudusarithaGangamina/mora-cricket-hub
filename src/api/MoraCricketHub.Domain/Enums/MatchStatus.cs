using System;
using System.Collections.Generic;
using System.Text;

namespace MoraCricketHub.Domain.Enums;

public enum MatchStatus
{
    Completed,
    Abandoned,           // After toss, before play
    Drawn,        
    NoResult,            // Play started, rain/bad light ended it
    PreTossAbandoned,    // Washed out before toss — counts for team records only, never player stats
}
