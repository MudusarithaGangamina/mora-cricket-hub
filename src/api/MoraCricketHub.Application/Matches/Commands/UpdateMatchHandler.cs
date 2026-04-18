using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Common;
using MoraCricketHub.Application.Matches.Interfaces;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Application.Matches.Commands;

public class UpdateMatchHandler : IRequestHandler<UpdateMatchCommand, bool>
{
    private readonly IMatchRepository _repo;
    public UpdateMatchHandler(IMatchRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        UpdateMatchCommand r, CancellationToken ct)
    {
        var match = await _repo.FindByIdAsync(r.MatchId, ct);
        if (match is null) return false;

        // Cannot edit a confirmed match
        if (match.IsConfirmed) return false;

        match.TournamentId = r.TournamentId;
        match.OpponentId = r.OpponentId;
        match.VenueId = r.VenueId;
        match.MatchDate = DateOnly.Parse(r.MatchDate);
        match.ScheduledOvers = r.ScheduledOvers;
        match.VenueType = EnumParser.Parse<VenueType>(r.VenueType);
        match.SurfaceType = EnumParser.Parse<SurfaceType>(r.SurfaceType);
        match.BallColour = EnumParser.Parse<BallColour>(r.BallColour);
        match.BallType = EnumParser.Parse<BallType>(r.BallType);
        match.RoundType = EnumParser.Parse<RoundType>(r.RoundType);
        match.RoundLabel = r.RoundLabel?.Trim();
        match.TossHeld = r.TossHeld;
        match.TossWinner = r.TossWinner;
        match.TossDecision = r.TossDecision;
        match.MoraBattingFirst = r.MoraBattingFirst;
        match.Status = EnumParser.Parse<MatchStatus>(r.Status);
        match.ResultType = EnumParser.ParseNullable<ResultType>(
                                        r.ResultType);
        match.ResultMargin = r.ResultMargin;
        match.ResultMarginType = r.ResultMarginType;
        match.DlsApplied = r.DlsApplied;
        match.DlsTarget = r.DlsTarget;
        match.RevisedOvers = r.RevisedOvers;
        match.MoraCaptainId = r.MoraCaptainId;
        match.MoraWickeeperId = r.MoraWickeeperId;
        match.OpponentCaptainName = r.OpponentCaptainName?.Trim();
        match.PlayerOfMatchMoraId = r.PlayerOfMatchMoraId;
        match.PlayerOfMatchName = r.PlayerOfMatchName?.Trim();
        match.PlayerOfMatchTeam = r.PlayerOfMatchTeam;
        match.Notes = r.Notes?.Trim();

        return await _repo.UpdateAsync(match, ct);
    }
}
