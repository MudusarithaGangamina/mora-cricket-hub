using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Opponents.Interfaces;
using MoraCricketHub.Application.Players.Interfaces;
using MoraCricketHub.Application.Seasons.Interfaces;
using MoraCricketHub.Application.Tournaments.Interfaces;
using MoraCricketHub.Application.Venues.Interfaces;

namespace MoraCricketHub.Application.Common;

public class DeleteSeasonHandler : IRequestHandler<DeleteSeasonCommand, bool>
{
    private readonly ISeasonRepository _repo;
    public DeleteSeasonHandler(ISeasonRepository repo) => _repo = repo;
    public Task<bool> Handle(DeleteSeasonCommand r, CancellationToken ct)
        => _repo.DeleteAsync(r.SeasonId, ct);
}

public class DeleteTournamentHandler
    : IRequestHandler<DeleteTournamentCommand, bool>
{
    private readonly ITournamentRepository _repo;
    public DeleteTournamentHandler(ITournamentRepository repo) => _repo = repo;
    public Task<bool> Handle(DeleteTournamentCommand r, CancellationToken ct)
        => _repo.DeleteAsync(r.TournamentId, ct);
}

public class DeleteVenueHandler : IRequestHandler<DeleteVenueCommand, bool>
{
    private readonly IVenueRepository _repo;
    public DeleteVenueHandler(IVenueRepository repo) => _repo = repo;
    public Task<bool> Handle(DeleteVenueCommand r, CancellationToken ct)
        => _repo.DeleteAsync(r.VenueId, ct);
}

public class DeleteOpponentHandler
    : IRequestHandler<DeleteOpponentCommand, bool>
{
    private readonly IOpponentRepository _repo;
    public DeleteOpponentHandler(IOpponentRepository repo) => _repo = repo;
    public Task<bool> Handle(DeleteOpponentCommand r, CancellationToken ct)
        => _repo.DeleteAsync(r.OpponentId, ct);
}

public class DeleteOpponentPlayerHandler
    : IRequestHandler<DeleteOpponentPlayerCommand, bool>
{
    private readonly IOpponentRepository _repo;
    public DeleteOpponentPlayerHandler(IOpponentRepository repo) => _repo = repo;
    public Task<bool> Handle(DeleteOpponentPlayerCommand r, CancellationToken ct)
        => _repo.DeletePlayerAsync(r.OpponentPlayerId, ct);
}

public class DeletePlayerHandler : IRequestHandler<DeletePlayerCommand, bool>
{
    private readonly IPlayerRepository _repo;
    public DeletePlayerHandler(IPlayerRepository repo) => _repo = repo;
    public Task<bool> Handle(DeletePlayerCommand r, CancellationToken ct)
        => _repo.DeleteAsync(r.PlayerId, ct);
}
