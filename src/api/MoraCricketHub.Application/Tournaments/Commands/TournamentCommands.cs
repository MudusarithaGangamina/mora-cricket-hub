using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Tournaments.Commands;

public record CreateTournamentCommand(
    Guid SeasonId,
    string Name,
    string Format,
    int OversPerSide
) : IRequest<Guid>;

public record UpdateTournamentCommand(
    Guid TournamentId,
    Guid SeasonId,
    string Name,
    string Format,
    int OversPerSide
) : IRequest<bool>;
