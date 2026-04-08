using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Tournaments.Interfaces;

namespace MoraCricketHub.Application.Tournaments.Queries;

public class GetAllTournamentsHandler
    : IRequestHandler<GetAllTournamentsQuery, List<TournamentDto>>
{
    private readonly ITournamentRepository _repo;
    public GetAllTournamentsHandler(ITournamentRepository repo) => _repo = repo;

    public Task<List<TournamentDto>> Handle(
        GetAllTournamentsQuery request, CancellationToken ct)
        => _repo.GetAllAsync(request.SeasonId, ct);
}

public class GetTournamentByIdHandler
    : IRequestHandler<GetTournamentByIdQuery, TournamentDto?>
{
    private readonly ITournamentRepository _repo;
    public GetTournamentByIdHandler(ITournamentRepository repo) => _repo = repo;

    public Task<TournamentDto?> Handle(
        GetTournamentByIdQuery request, CancellationToken ct)
        => _repo.GetByIdAsync(request.TournamentId, ct);
}
