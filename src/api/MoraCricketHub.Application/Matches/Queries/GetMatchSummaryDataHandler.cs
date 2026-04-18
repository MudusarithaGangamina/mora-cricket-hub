using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Matches.Interfaces;

namespace MoraCricketHub.Application.Matches.Queries;

public class GetMatchSummaryDataHandler
    : IRequestHandler<GetMatchSummaryDataQuery, MatchSummaryDataDto?>
{
    private readonly IMatchRepository _repo;
    public GetMatchSummaryDataHandler(IMatchRepository repo) => _repo = repo;

    public Task<MatchSummaryDataDto?> Handle(
        GetMatchSummaryDataQuery r, CancellationToken ct)
        => _repo.GetMatchSummaryDataAsync(r.MatchId, ct);
}
