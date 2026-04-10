using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Matches.Interfaces;

namespace MoraCricketHub.Application.Matches.Queries;

public class GetAllMatchesHandler
    : IRequestHandler<GetAllMatchesQuery, PagedMatchesDto>
{
    private readonly IMatchRepository _repo;
    public GetAllMatchesHandler(IMatchRepository repo) => _repo = repo;

    public Task<PagedMatchesDto> Handle(
        GetAllMatchesQuery request, CancellationToken ct)
        => _repo.GetAllAsync(request, ct);
}

public class GetMatchByIdHandler
    : IRequestHandler<GetMatchByIdQuery, MatchDetailDto?>
{
    private readonly IMatchRepository _repo;
    public GetMatchByIdHandler(IMatchRepository repo) => _repo = repo;

    public Task<MatchDetailDto?> Handle(
        GetMatchByIdQuery request, CancellationToken ct)
        => _repo.GetByIdAsync(request.MatchId, ct);
}
