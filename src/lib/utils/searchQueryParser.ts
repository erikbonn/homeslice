interface ParsedSearchQuery {
  type: "city" | "county" | "state" | "zipcode";
  city?: string;
  state?: string;
  county?: string;
  zipcode?: string;
  name?: string;
}

export function parseSearchQuery(query: string): ParsedSearchQuery {
  // Trim and normalize the query
  const normalizedQuery = query.trim().toLowerCase();

  // Check for zipcode (5 or 5+4 digits)
  const zipcodeRegex = /\b\d{5}(?:-\d{4})?\b/;
  const zipcodeMatch = zipcodeRegex.exec(normalizedQuery);
  if (zipcodeMatch?.[0]) {
    return {
      type: "zipcode",
      zipcode: zipcodeMatch[0],
    };
  }

  // Check for city, state format
  const cityStateRegex = /^([^,]+),\s*([a-z]{2}|[a-z\s]+)$/i;
  const cityStateMatch = cityStateRegex.exec(normalizedQuery);
  if (cityStateMatch?.[1] && cityStateMatch?.[2]) {
    return {
      type: "city",
      city: cityStateMatch[1].trim(),
      state: cityStateMatch[2].trim().toUpperCase(),
    };
  }

  // Check for county, state format
  const countyStateRegex = /^([^,]+)\s+county,\s*([a-z]{2}|[a-z\s]+)$/i;
  const countyStateMatch = countyStateRegex.exec(normalizedQuery);
  if (countyStateMatch?.[1] && countyStateMatch?.[2]) {
    return {
      type: "county",
      county: countyStateMatch[1].trim(),
      state: countyStateMatch[2].trim().toUpperCase(),
    };
  }

  // Check for state name or abbreviation
  const stateRegex = /^([a-z]{2}|[a-z\s]+)$/i;
  const stateMatch = stateRegex.exec(normalizedQuery);
  if (stateMatch?.[1]) {
    return {
      type: "state",
      state: stateMatch[1].trim().toUpperCase(),
    };
  }

  // Default to treating as a city name
  return {
    type: "city",
    name: normalizedQuery,
  };
}

// Helper function to convert parsed query to URL parameters
export function queryToParams(query: ParsedSearchQuery): URLSearchParams {
  const params = new URLSearchParams();

  // Add type parameter
  params.append("type", query.type);

  // Add specific parameters based on type
  switch (query.type) {
    case "city":
      if (query.city) params.append("city", query.city);
      if (query.state) params.append("state", query.state);
      if (query.name) params.append("name", query.name);
      break;
    case "county":
      if (query.county) params.append("county", query.county);
      if (query.state) params.append("state", query.state);
      break;
    case "state":
      if (query.state) params.append("state", query.state);
      break;
    case "zipcode":
      if (query.zipcode) params.append("zipcode", query.zipcode);
      break;
  }

  return params;
}
