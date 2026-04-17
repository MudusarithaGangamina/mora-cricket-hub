using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Common;

// ── These follow the same pattern — just the entity type changes ─────────

public record DeleteSeasonCommand(Guid SeasonId) : IRequest<bool>;
public record DeleteTournamentCommand(Guid TournamentId) : IRequest<bool>;
public record DeleteVenueCommand(Guid VenueId) : IRequest<bool>;
public record DeleteOpponentCommand(Guid OpponentId) : IRequest<bool>;
public record DeleteOpponentPlayerCommand(Guid OpponentPlayerId) : IRequest<bool>;
public record DeletePlayerCommand(Guid PlayerId) : IRequest<bool>;
