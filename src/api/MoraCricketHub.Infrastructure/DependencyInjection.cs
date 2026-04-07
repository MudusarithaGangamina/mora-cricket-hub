using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MoraCricketHub.Application.Players.Interfaces;
using MoraCricketHub.Infrastructure.Persistence;
using MoraCricketHub.Infrastructure.Repositories;

namespace MoraCricketHub.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsAssembly(
                    typeof(AppDbContext).Assembly.FullName)
            ));

        // Repositories — add every new one here as you build them
        services.AddScoped<IPlayerRepository, PlayerRepository>();

        return services;
    }
}
