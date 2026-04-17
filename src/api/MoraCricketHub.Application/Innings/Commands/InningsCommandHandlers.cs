using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Common;
using MoraCricketHub.Application.Innings.Interfaces;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Application.Innings.Commands;

// ── Create innings ────────────────────────────────────────────────────────────
public class CreateInningsHandler : IRequestHandler<CreateInningsCommand, Guid>
{
    private readonly IInningsRepository _repo;
    public CreateInningsHandler(IInningsRepository repo) => _repo = repo;

    public Task<Guid> Handle(CreateInningsCommand r, CancellationToken ct)
        => _repo.CreateInningsAsync(new MoraCricketHub.Domain.Entities.Innings
        {
            MatchId = r.MatchId,
            InningsNumber = r.InningsNumber,
            InningsType = EnumParser.Parse<InningsType>(r.InningsType),
            BattingTeam = EnumParser.Parse<BattingTeam>(r.BattingTeam),
            MoraWickeeperId = r.MoraWickeeperId,
            CommentaryCoverage = EnumParser.Parse<CommentaryCoverage>(
                                    r.CommentaryCoverage),
            ScheduledOvers = r.scheduledOvers,
            MaxOvers = r.scheduledOvers,
        }, ct);
}

// ── Update totals ─────────────────────────────────────────────────────────────
public class UpdateInningsTotalsHandler
    : IRequestHandler<UpdateInningsTotalsCommand, bool>
{
    private readonly IInningsRepository _repo;
    public UpdateInningsTotalsHandler(IInningsRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        UpdateInningsTotalsCommand r, CancellationToken ct)
    {
        var innings = await _repo.FindByIdAsync(r.InningsId, ct);
        if (innings is null) return false;

        innings.TotalRuns = r.TotalRuns;
        innings.TotalWickets = r.TotalWickets;
        innings.TotalOversFaced = r.TotalOversFaced;
        innings.ExtrasWides = r.ExtrasWides;
        innings.ExtrasNoBalls = r.ExtrasNoBalls;
        innings.ExtrasLegByes = r.ExtrasLegByes;
        innings.ExtrasByes = r.ExtrasByes;
        innings.ExtrasPenalty = r.ExtrasPenalty;

        return await _repo.UpdateInningsAsync(innings, ct);
    }
}

// ── Mora batting ──────────────────────────────────────────────────────────────
public class AddMoraBattingHandler : IRequestHandler<AddMoraBattingCommand, Guid>
{
    private readonly IInningsRepository _repo;
    public AddMoraBattingHandler(IInningsRepository repo) => _repo = repo;

    public Task<Guid> Handle(AddMoraBattingCommand r, CancellationToken ct)
    {
        var perf = new MoraBattingPerformance
        {
            InningsId = r.InningsId,
            PlayerId = r.PlayerId,
            BattingPosition = r.BattingPosition,
            Runs = r.Runs,
            BallsFaced = r.BallsFaced,
            Fours = r.Fours,
            Sixes = r.Sixes,
            IsNotOut = r.IsNotOut,
            MinutesBatted = r.MinutesBatted,
            DismissalType = r.DismissalType,
            DismissedByOppBowlerId = r.DismissedByOppBowlerId,
            DismissedByOppBowlerName = r.DismissedByOppBowlerName,
            DismissedByOppBowlerStyle = r.DismissedByOppBowlerStyle,
            FieldedByMoraPlayerId = r.FieldedByMoraPlayerId,
            FieldedByOppName = r.FieldedByOppName,
            // Auto-compute milestone flags
            IsDuck = r.Runs == 0 && !r.IsNotOut,
            IsThirty = r.Runs >= 30 && r.Runs < 50,
            IsFifty = r.Runs >= 50 && r.Runs < 100,
            IsHundred = r.Runs >= 100,
        };
        return _repo.AddMoraBattingAsync(perf, ct);
    }
}

public class UpdateMoraBattingHandler
    : IRequestHandler<UpdateMoraBattingCommand, bool>
{
    private readonly IInningsRepository _repo;
    public UpdateMoraBattingHandler(IInningsRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        UpdateMoraBattingCommand r, CancellationToken ct)
    {
        var perf = await _repo.FindMoraBattingAsync(r.PerformanceId, ct);
        if (perf is null) return false;

        perf.Runs = r.Runs;
        perf.BallsFaced = r.BallsFaced;
        perf.Fours = r.Fours;
        perf.Sixes = r.Sixes;
        perf.IsNotOut = r.IsNotOut;
        perf.MinutesBatted = r.MinutesBatted;
        perf.DismissalType = r.DismissalType;
        perf.DismissedByOppBowlerId = r.DismissedByOppBowlerId;
        perf.DismissedByOppBowlerName = r.DismissedByOppBowlerName;
        perf.DismissedByOppBowlerStyle = r.DismissedByOppBowlerStyle;
        perf.FieldedByMoraPlayerId = r.FieldedByMoraPlayerId;
        perf.FieldedByOppName = r.FieldedByOppName;
        perf.IsDuck = r.Runs == 0 && !r.IsNotOut;
        perf.IsThirty = r.Runs >= 30 && r.Runs < 50;
        perf.IsFifty = r.Runs >= 50 && r.Runs < 100;
        perf.IsHundred = r.Runs >= 100;

        return await _repo.UpdateMoraBattingAsync(perf, ct);
    }
}

// ── Opponent batting ──────────────────────────────────────────────────────────
public class AddOpponentBattingHandler
    : IRequestHandler<AddOpponentBattingCommand, Guid>
{
    private readonly IInningsRepository _repo;
    public AddOpponentBattingHandler(IInningsRepository repo) => _repo = repo;

    public Task<Guid> Handle(AddOpponentBattingCommand r, CancellationToken ct)
        => _repo.AddOpponentBattingAsync(new OpponentBattingPerformance
        {
            InningsId = r.InningsId,
            OpponentPlayerId = r.OpponentPlayerId,
            PlayerName = r.PlayerName.Trim(),
            BattingStyle = r.BattingStyle,
            BattingPosition = r.BattingPosition,
            Runs = r.Runs,
            BallsFaced = r.BallsFaced,
            Fours = r.Fours,
            Sixes = r.Sixes,
            IsNotOut = r.IsNotOut,
            MinutesBatted = r.MinutesBatted,
            DismissalType = r.DismissalType,
            DismissedByMoraBowlerId = r.DismissedByMoraBowlerId,
            FieldedByMoraPlayerId = r.FieldedByMoraPlayerId,
        }, ct);
}

public class UpdateOpponentBattingHandler
    : IRequestHandler<UpdateOpponentBattingCommand, bool>
{
    private readonly IInningsRepository _repo;
    public UpdateOpponentBattingHandler(IInningsRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        UpdateOpponentBattingCommand r, CancellationToken ct)
    {
        var perf = await _repo.FindOpponentBattingAsync(r.PerformanceId, ct);
        if (perf is null) return false;

        perf.Runs = r.Runs;
        perf.BallsFaced = r.BallsFaced;
        perf.Fours = r.Fours;
        perf.Sixes = r.Sixes;
        perf.IsNotOut = r.IsNotOut;
        perf.MinutesBatted = r.MinutesBatted;
        perf.DismissalType = r.DismissalType;
        perf.DismissedByMoraBowlerId = r.DismissedByMoraBowlerId;
        perf.FieldedByMoraPlayerId = r.FieldedByMoraPlayerId;

        return await _repo.UpdateOpponentBattingAsync(perf, ct);
    }
}

// ── Mora bowling ──────────────────────────────────────────────────────────────
public class AddMoraBowlingHandler : IRequestHandler<AddMoraBowlingCommand, Guid>
{
    private readonly IInningsRepository _repo;
    public AddMoraBowlingHandler(IInningsRepository repo) => _repo = repo;

    public Task<Guid> Handle(AddMoraBowlingCommand r, CancellationToken ct)
        => _repo.AddMoraBowlingAsync(new MoraBowlingPerformance
        {
            InningsId = r.InningsId,
            PlayerId = r.PlayerId,
            OversBowled = r.OversBowled,
            Maidens = r.Maidens,
            RunsConceded = r.RunsConceded,
            Wickets = r.Wickets,
            Wides = r.Wides,
            NoBalls = r.NoBalls,
            IsFourWicketHaul = r.Wickets == 4,
            IsFiveWicketHaul = r.Wickets >= 5,
        }, ct);
}

public class UpdateMoraBowlingHandler
    : IRequestHandler<UpdateMoraBowlingCommand, bool>
{
    private readonly IInningsRepository _repo;
    public UpdateMoraBowlingHandler(IInningsRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        UpdateMoraBowlingCommand r, CancellationToken ct)
    {
        var perf = await _repo.FindMoraBowlingAsync(r.PerformanceId, ct);
        if (perf is null) return false;

        perf.OversBowled = r.OversBowled;
        perf.Maidens = r.Maidens;
        perf.RunsConceded = r.RunsConceded;
        perf.Wickets = r.Wickets;
        perf.Wides = r.Wides;
        perf.NoBalls = r.NoBalls;
        perf.IsFourWicketHaul = r.Wickets == 4;
        perf.IsFiveWicketHaul = r.Wickets >= 5;

        return await _repo.UpdateMoraBowlingAsync(perf, ct);
    }
}

// ── Opponent bowling ──────────────────────────────────────────────────────────
public class AddOpponentBowlingHandler
    : IRequestHandler<AddOpponentBowlingCommand, Guid>
{
    private readonly IInningsRepository _repo;
    public AddOpponentBowlingHandler(IInningsRepository repo) => _repo = repo;

    public Task<Guid> Handle(AddOpponentBowlingCommand r, CancellationToken ct)
        => _repo.AddOpponentBowlingAsync(new OpponentBowlingPerformance
        {
            InningsId = r.InningsId,
            OpponentPlayerId = r.OpponentPlayerId,
            PlayerName = r.PlayerName.Trim(),
            BowlingStyle = r.BowlingStyle,
            OversBowled = r.OversBowled,
            Maidens = r.Maidens,
            RunsConceded = r.RunsConceded,
            Wickets = r.Wickets,
            Wides = r.Wides,
            NoBalls = r.NoBalls,
        }, ct);
}

public class UpdateOpponentBowlingHandler
    : IRequestHandler<UpdateOpponentBowlingCommand, bool>
{
    private readonly IInningsRepository _repo;
    public UpdateOpponentBowlingHandler(IInningsRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        UpdateOpponentBowlingCommand r, CancellationToken ct)
    {
        var perf = await _repo.FindOpponentBowlingAsync(r.PerformanceId, ct);
        if (perf is null) return false;

        perf.OversBowled = r.OversBowled;
        perf.Maidens = r.Maidens;
        perf.RunsConceded = r.RunsConceded;
        perf.Wickets = r.Wickets;
        perf.Wides = r.Wides;
        perf.NoBalls = r.NoBalls;

        return await _repo.UpdateOpponentBowlingAsync(perf, ct);
    }
}

// ── Fall of wickets ───────────────────────────────────────────────────────────
public class AddFallOfWicketHandler
    : IRequestHandler<AddFallOfWicketCommand, Guid>
{
    private readonly IInningsRepository _repo;
    public AddFallOfWicketHandler(IInningsRepository repo) => _repo = repo;

    public Task<Guid> Handle(AddFallOfWicketCommand r, CancellationToken ct)
        => _repo.AddFallOfWicketAsync(new FallOfWicket
        {
            InningsId = r.InningsId,
            WicketNumber = r.WicketNumber,
            ScoreAtFall = r.ScoreAtFall,
            OverAtFall = r.OverAtFall,
            DismissedMoraPlayerId = r.DismissedMoraPlayerId,
            DismissedOppPlayerId = r.DismissedOppPlayerId,
            DismissedPlayerName = r.DismissedPlayerName.Trim(),
        }, ct);
}

// ── Partnership ───────────────────────────────────────────────────────────────
public class AddPartnershipHandler : IRequestHandler<AddPartnershipCommand, Guid>
{
    private readonly IInningsRepository _repo;
    public AddPartnershipHandler(IInningsRepository repo) => _repo = repo;

    public Task<Guid> Handle(AddPartnershipCommand r, CancellationToken ct)
        => _repo.AddPartnershipAsync(new Partnership
        {
            InningsId = r.InningsId,
            WicketNumber = r.WicketNumber,
            MoraBatter1Id = r.MoraBatter1Id,
            MoraBatter2Id = r.MoraBatter2Id,
            OppBatter1Id = r.OppBatter1Id,
            OppBatter1Name = r.OppBatter1Name,
            OppBatter2Id = r.OppBatter2Id,
            OppBatter2Name = r.OppBatter2Name,
            Runs = r.Runs,
            Balls = r.Balls,
            Batter1Runs = r.Batter1Runs,
            Batter2Runs = r.Batter2Runs,
            Unbroken = r.Unbroken,
        }, ct);
}

// ── Mora fielding ─────────────────────────────────────────────────────────────
public class AddMoraFieldingHandler
    : IRequestHandler<AddMoraFieldingCommand, Guid>
{
    private readonly IInningsRepository _repo;
    public AddMoraFieldingHandler(IInningsRepository repo) => _repo = repo;

    public Task<Guid> Handle(AddMoraFieldingCommand r, CancellationToken ct)
        => _repo.AddMoraFieldingAsync(new MoraFieldingPerformance
        {
            InningsId = r.InningsId,
            PlayerId = r.PlayerId,
            Catches = r.Catches,
            RunOuts = r.RunOuts,
            Stumpings = r.Stumpings,
            DroppedCatches = r.DroppedCatches,
        }, ct);
}

public class UpdateMoraFieldingHandler
    : IRequestHandler<UpdateMoraFieldingCommand, bool>
{
    private readonly IInningsRepository _repo;
    public UpdateMoraFieldingHandler(IInningsRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        UpdateMoraFieldingCommand r, CancellationToken ct)
    {
        var perf = await _repo.FindMoraFieldingAsync(r.PerformanceId, ct);
        if (perf is null) return false;

        perf.Catches = r.Catches;
        perf.RunOuts = r.RunOuts;
        perf.Stumpings = r.Stumpings;
        perf.DroppedCatches = r.DroppedCatches;

        return await _repo.UpdateMoraFieldingAsync(perf, ct);
    }
}
