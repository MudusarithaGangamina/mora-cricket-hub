using FluentValidation;
using MediatR;
using MoraCricketHub.Application.Common;
using MoraCricketHub.Application.Matches.Interfaces;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace MoraCricketHub.Application.Matches.Commands;

// ── Create ────────────────────────────────────────────────────────────────────
public class CreateMatchHandler : IRequestHandler<CreateMatchCommand, Guid>
{
    private readonly IMatchRepository _repo;
    public CreateMatchHandler(IMatchRepository repo) => _repo = repo;

    public Task<Guid> Handle(CreateMatchCommand r, CancellationToken ct)
    {
        var match = new Match
        {
            TournamentId = r.TournamentId,
            OpponentId = r.OpponentId,
            VenueId = r.VenueId,
            MatchDate = DateOnly.Parse(r.MatchDate),
            ScheduledOvers = r.ScheduledOvers,
            VenueType = Enum.Parse<VenueType>(r.VenueType, true),
            SurfaceType = Enum.Parse<SurfaceType>(r.SurfaceType, true),
            BallColour = Enum.Parse<BallColour>(r.BallColour, true),
            BallType = Enum.Parse<BallType>(r.BallType, true),
            RoundType = Enum.Parse<RoundType>(r.RoundType, true),
            RoundLabel = r.RoundLabel?.Trim(),
            TossHeld = r.TossHeld,
            TossWinner = r.TossWinner,
            TossDecision = r.TossDecision,
            MoraBattingFirst = r.MoraBattingFirst,
            Status = EnumParser.Parse<MatchStatus>(r.Status),
            ResultType = EnumParser.ParseNullable<ResultType>(r.ResultType),
            ResultMargin = r.ResultMargin,
            ResultMarginType = r.ResultMarginType,
            DlsApplied = r.DlsApplied,
            DlsTarget = r.DlsTarget,
            RevisedOvers = r.RevisedOvers,
            MoraCaptainId = r.MoraCaptainId,
            MoraWickeeperId = r.MoraWickeeperId,
            OpponentCaptainName = r.OpponentCaptainName?.Trim(),
            PlayerOfMatchMoraId = r.PlayerOfMatchMoraId,
            PlayerOfMatchName = r.PlayerOfMatchName?.Trim(),
            PlayerOfMatchTeam = r.PlayerOfMatchTeam,
            Notes = r.Notes?.Trim(),
        };

        return _repo.CreateAsync(match, ct);
    }
}

// ── Update Result ─────────────────────────────────────────────────────────────
public class UpdateMatchResultHandler
    : IRequestHandler<UpdateMatchResultCommand, bool>
{
    private readonly IMatchRepository _repo;
    public UpdateMatchResultHandler(IMatchRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        UpdateMatchResultCommand r, CancellationToken ct)
    {
        var match = await _repo.FindByIdAsync(r.MatchId, ct);
        if (match is null) return false;

        match.Status = EnumParser.Parse<MatchStatus>(r.Status);
        match.ResultType = EnumParser.ParseNullable<ResultType>(r.ResultType);
        match.ResultMargin = r.ResultMargin;
        match.ResultMarginType = r.ResultMarginType;
        match.DlsApplied = r.DlsApplied;
        match.DlsTarget = r.DlsTarget;
        match.RevisedOvers = r.RevisedOvers;
        match.PlayerOfMatchMoraId = r.PlayerOfMatchMoraId;
        match.PlayerOfMatchName = r.PlayerOfMatchName?.Trim();
        match.PlayerOfMatchTeam = r.PlayerOfMatchTeam;
        match.Notes = r.Notes?.Trim();

        return await _repo.UpdateAsync(match, ct);
    }
}
