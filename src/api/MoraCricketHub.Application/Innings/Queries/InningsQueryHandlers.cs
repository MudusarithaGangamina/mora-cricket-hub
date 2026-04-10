using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Innings.Interfaces;

namespace MoraCricketHub.Application.Innings.Queries;

public class GetInningsScorecardHandler
    : IRequestHandler<GetInningsScorecardQuery, InningsScorecardDto?>
{
    private readonly IInningsRepository _repo;
    public GetInningsScorecardHandler(IInningsRepository repo) => _repo = repo;

    public Task<InningsScorecardDto?> Handle(
        GetInningsScorecardQuery request, CancellationToken ct)
        => _repo.GetScorecardAsync(request.InningsId, ct);
}

public class GetMatchScorecardsHandler
    : IRequestHandler<GetMatchScorecardsQuery, List<InningsScorecardDto>>
{
    private readonly IInningsRepository _repo;
    public GetMatchScorecardsHandler(IInningsRepository repo) => _repo = repo;

    public Task<List<InningsScorecardDto>> Handle(
        GetMatchScorecardsQuery request, CancellationToken ct)
        => _repo.GetMatchScorecardsAsync(request.MatchId, ct);
}
